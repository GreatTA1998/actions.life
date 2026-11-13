import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { z } from 'zod'

// FIREBASE_SERVICE_ACCOUNT is the service-account JSON. When it is unset, tasks
// and OAuth grants stay in memory and verifyIdToken is refused.
// AGENT_TOKEN_SECRET signs access tokens. When it is unset, a dev constant is
// used only if FIREBASE_SERVICE_ACCOUNT is also unset, so local runs still work.
const LOCAL_TOKEN_SECRET = 'actions-life-local-agent'
const CODE_MS = 5 * 60 * 1000
const REFRESH_MS = 30 * 24 * 60 * 60 * 1000
const ACCESS_S = 60 * 60

const memory = { users: new Map(), tasks: new Map() }

function firestore () {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT
  if (!raw) return null
  if (!getApps().length) initializeApp({ credential: cert(JSON.parse(raw)) })
  return getFirestore()
}

function tokenSecret () {
  if (process.env.AGENT_TOKEN_SECRET) return process.env.AGENT_TOKEN_SECRET
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) return LOCAL_TOKEN_SECRET
  throw new Error('Set AGENT_TOKEN_SECRET')
}

function oauthError (code, message) {
  const error = new Error(message)
  error.code = code
  return error
}

function b64 (value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url')
}

function signAccessToken (uid) {
  const body = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ uid, exp: Math.floor(Date.now() / 1000) + ACCESS_S })}`
  return `${body}.${createHmac('sha256', tokenSecret()).update(body).digest('base64url')}`
}

function verifyAccessToken (token) {
  const [header, payload, signature] = token.split('.')
  if (!header || !payload || !signature) return null
  const expected = createHmac('sha256', tokenSecret()).update(`${header}.${payload}`).digest('base64url')
  const left = Buffer.from(signature)
  const right = Buffer.from(expected)
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null
  const claims = JSON.parse(Buffer.from(payload, 'base64url').toString())
  if (!claims.uid || claims.exp < Math.floor(Date.now() / 1000)) return null
  return claims.uid
}

export function protectedResource (origin) {
  return {
    resource: `${origin}/mcp`,
    authorization_servers: [origin],
    scopes_supported: ['tasks'],
    bearer_methods_supported: ['header']
  }
}

export function authorizationServer (origin) {
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/oauth/authorize`,
    token_endpoint: `${origin}/oauth/token`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    client_id_metadata_document_supported: true,
    scopes_supported: ['tasks', 'offline_access']
  }
}

function uidFrom (request) {
  const header = request.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null
  try { return verifyAccessToken(token) } catch { return null }
}

function callsTool (body) {
  const messages = Array.isArray(body) ? body : [body]
  return messages.some(message => message?.method === 'tools/call')
}

function unauthorized (origin) {
  return new Response(JSON.stringify({
    error: 'invalid_token',
    error_description: 'Authentication required'
  }), {
    status: 401,
    headers: {
      'content-type': 'application/json',
      'WWW-Authenticate': `Bearer error="invalid_token", error_description="Authentication required", resource_metadata="${origin}/.well-known/oauth-protected-resource/mcp", scope="tasks"`
    }
  })
}

export async function handleMcp (request) {
  const origin = new URL(request.url).origin
  if (request.method !== 'POST') return dispatch(request, undefined, uidFrom(request))
  let body
  try { body = await request.json() }
  catch { return Response.json({ error: 'invalid_request' }, { status: 400 }) }
  const uid = uidFrom(request)
  if (callsTool(body) && !uid) return unauthorized(origin)
  return dispatch(request, body, uid)
}

async function dispatch (request, body, uid) {
  const mcp = buildServer(uid)
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  })
  await mcp.connect(transport)
  return transport.handleRequest(request, body === undefined ? undefined : { parsedBody: body })
}

function buildServer (uid) {
  const mcp = new McpServer({ name: 'actions-life', version: '1.0.0' })
  const bind = (run) => async (args) => {
    try {
      if (!uid) throw new Error('Authentication required')
      return { content: [{ type: 'text', text: JSON.stringify(await run(uid, args)) }] }
    } catch (error) {
      return { isError: true, content: [{ type: 'text', text: error.message }] }
    }
  }
  mcp.registerTool('list_tasks', {
    description: 'List tasks. With no filters, returns tasks on the list. startDate and endDate are yyyy-MM-dd.',
    inputSchema: { onList: z.boolean().optional(), startDate: z.string().optional(), endDate: z.string().optional() }
  }, bind(listTasks))
  mcp.registerTool('create_task', {
    description: 'Create a root task (no parent). Scheduling in simple mode takes it off the list.',
    inputSchema: taskFields
  }, bind(createTask))
  mcp.registerTool('update_task', {
    description: 'Update a task by id. A date change is only allowed on a root task with no children. simpleMode matches the app.',
    inputSchema: { id: z.string(), ...taskFields.shape }
  }, bind(updateTask))
  mcp.registerTool('delete_task', {
    description: 'Delete one task by id. Refuses when that task has children.',
    inputSchema: { id: z.string() }
  }, bind(deleteTask))
  return mcp
}

const taskFields = z.object({
  name: z.string().optional(),
  notes: z.string().optional(),
  duration: z.number().optional(),
  startDateISO: z.string().optional(),
  startTime: z.string().optional(),
  timeZone: z.string().optional(),
  onList: z.boolean().optional(),
  isDone: z.boolean().optional(),
  parentID: z.string().optional()
})

function taskMap (uid) {
  if (!memory.tasks.has(uid)) memory.tasks.set(uid, new Map())
  return memory.tasks.get(uid)
}

async function loadUser (uid) {
  if (!firestore()) {
    if (!memory.users.has(uid)) memory.users.set(uid, { simpleMode: false, maxOrderValue: 10 })
    return memory.users.get(uid)
  }
  const snap = await firestore().doc(`users/${uid}`).get()
  if (!snap.exists) throw new Error('No actions.life account for this login')
  return snap.data()
}

async function allTasks (uid) {
  if (!firestore()) return [...taskMap(uid).values()]
  const snap = await firestore().collection(`users/${uid}/tasks`).get()
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

async function getTask (uid, id) {
  const task = (await allTasks(uid)).find(item => item.id === id)
  if (!task) throw new Error('Task not found')
  return task
}

async function hasChild (uid, id) {
  if (!firestore()) return [...taskMap(uid).values()].some(task => task.parentID === id)
  const snap = await firestore().collection(`users/${uid}/tasks`).where('parentID', '==', id).limit(1).get()
  return !snap.empty
}

async function saveTask (uid, task) {
  if (!firestore()) { taskMap(uid).set(task.id, task); return }
  await firestore().doc(`users/${uid}/tasks/${task.id}`).set(task)
}

function present (task) {
  const { id, name, notes, isDone, onList, startDateISO, startTime, duration, parentID, orderValue, rootID, treeISOs } = task
  return { id, name, notes, isDone, onList, startDateISO, startTime, duration, parentID, orderValue, rootID, treeISOs }
}

function isoDate (value) {
  if (value == null || value === '') return ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(new Date(value).getTime())) {
    throw new Error('startDateISO must be yyyy-MM-dd')
  }
  return value
}

function randomID () {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  for (let i = 0; i < 20; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

function finishCreate (id, draft, user) {
  const data = { ...draft }
  if (user.simpleMode && data.startDateISO) data.onList = false
  const orderValue = (user.maxOrderValue ?? 10) + 1
  return {
    ...data,
    id,
    parentID: '',
    iconURL: '',
    templateID: '',
    imageDownloadURL: '',
    imageFullPath: '',
    childrenLayout: 'normal',
    photoLayout: 'split-view',
    isCollapsed: false,
    tagIDs: [],
    orderValue,
    treeISOs: data.startDateISO ? [data.startDateISO] : [],
    rootID: id
  }
}

async function listTasks (uid, args) {
  const tasks = await allTasks(uid)
  return tasks.filter(task => {
    if (args.onList != null && task.onList !== args.onList) return false
    if (args.startDate && !(task.startDateISO >= args.startDate)) return false
    if (args.endDate && !(task.startDateISO <= args.endDate)) return false
    if (args.onList == null && !args.startDate && !args.endDate && !task.onList) return false
    return true
  }).map(present)
}

async function createTask (uid, input) {
  if (input.parentID) throw new Error('Only root tasks can be created')
  const id = randomID()
  const draft = {
    name: input.name ?? '',
    duration: input.duration ?? 30,
    startTime: input.startTime ?? '',
    timeZone: input.timeZone || 'UTC',
    startDateISO: isoDate(input.startDateISO),
    notes: input.notes ?? '',
    isDone: input.isDone ?? false,
    onList: input.onList ?? true
  }
  if (!firestore()) {
    const user = await loadUser(uid)
    const task = finishCreate(id, draft, user)
    user.maxOrderValue = task.orderValue
    taskMap(uid).set(id, task)
    return present(task)
  }
  let saved
  await firestore().runTransaction(async (tx) => {
    const ref = firestore().doc(`users/${uid}`)
    const snap = await tx.get(ref)
    if (!snap.exists) throw new Error('No actions.life account for this login')
    const task = finishCreate(id, draft, snap.data())
    tx.set(firestore().doc(`users/${uid}/tasks/${id}`), task)
    tx.update(ref, { maxOrderValue: task.orderValue })
    saved = task
  })
  return present(saved)
}

async function updateTask (uid, input) {
  if (input.parentID) throw new Error('Changing parent is not supported')
  const task = await getTask(uid, input.id)
  const changes = {}
  for (const key of ['name', 'notes', 'isDone', 'onList', 'startTime', 'duration', 'startDateISO', 'timeZone']) {
    if (input[key] !== undefined) changes[key] = input[key]
  }
  if (changes.startDateISO !== undefined) changes.startDateISO = isoDate(changes.startDateISO)
  const user = await loadUser(uid)
  if (user.simpleMode) {
    if (changes.startDateISO) changes.onList = false
    else if (changes.onList) {
      changes.startDateISO = ''
      changes.startTime = ''
    }
  }
  if (changes.startDateISO !== undefined && changes.startDateISO !== task.startDateISO) {
    if (task.parentID || await hasChild(uid, task.id)) {
      throw new Error('Date changes are only allowed on a root task with no children')
    }
    changes.treeISOs = changes.startDateISO ? [changes.startDateISO] : []
  }
  const next = { ...task, ...changes }
  await saveTask(uid, next)
  return present(next)
}

async function deleteTask (uid, { id }) {
  await getTask(uid, id)
  if (await hasChild(uid, id)) throw new Error('Only tasks with no children can be deleted')
  if (!firestore()) taskMap(uid).delete(id)
  else await firestore().doc(`users/${uid}/tasks/${id}`).delete()
  return { id, deleted: true }
}

function publicClientId (clientId) {
  let url
  try { url = new URL(clientId) } catch { throw oauthError('invalid_request', 'client_id must be a URL') }
  if (url.protocol !== 'https:') throw oauthError('invalid_request', 'client_id must be an https URL')
  if (/^(localhost|127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(url.hostname) || url.hostname.endsWith('.local')) {
    throw oauthError('invalid_request', 'client_id host is not public')
  }
  return clientId
}

function loopback (hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

function redirectAllowed (redirectUri, redirectUris) {
  let requested
  try { requested = new URL(redirectUri) } catch { return false }
  return (redirectUris || []).some(registered => {
    const allowed = new URL(registered)
    if (loopback(requested.hostname) && requested.hostname === allowed.hostname) {
      return requested.protocol === allowed.protocol && requested.pathname === allowed.pathname
    }
    return requested.href === allowed.href
  })
}

async function clientMetadata (clientId) {
  publicClientId(clientId)
  const response = await fetch(clientId, { redirect: 'error', signal: AbortSignal.timeout(5000) })
  if (!response.ok) throw oauthError('invalid_request', 'Client metadata was not available')
  const document = await response.json()
  if (document.client_id !== clientId) throw oauthError('invalid_request', 'client_id does not match its metadata')
  return document
}

export async function approveConsent (fields) {
  if (fields.method !== 'S256' || !fields.challenge) throw oauthError('invalid_request', 'PKCE S256 is required')
  const document = await clientMetadata(fields.clientId)
  if (!redirectAllowed(fields.redirectUri, document.redirect_uris)) {
    throw oauthError('invalid_request', 'redirect_uri is not registered for this client')
  }
  if (!firestore()) throw oauthError('server_error', 'FIREBASE_SERVICE_ACCOUNT is not configured')
  const decoded = await getAuth().verifyIdToken(fields.idToken)
  if (!decoded.email) throw oauthError('access_denied', 'A Google account email is required')
  const code = randomBytes(32).toString('base64url')
  const grant = {
    uid: decoded.uid,
    clientId: fields.clientId,
    redirectUri: fields.redirectUri,
    challenge: fields.challenge,
    exp: Date.now() + CODE_MS
  }
  await firestore().collection('agentOauthCodes').doc(code).set(grant)
  const next = new URL(fields.redirectUri)
  next.searchParams.set('code', code)
  if (fields.state) next.searchParams.set('state', fields.state)
  return next.href
}

function pkce (verifier, challenge) {
  const expected = createHash('sha256').update(verifier).digest('base64url')
  const left = Buffer.from(expected)
  const right = Buffer.from(challenge)
  return left.length === right.length && timingSafeEqual(left, right)
}

async function issueTokens (uid) {
  const refreshToken = randomBytes(32).toString('base64url')
  await firestore().collection('agentRefreshTokens').doc(refreshToken).set({ uid, exp: Date.now() + REFRESH_MS })
  return { access_token: signAccessToken(uid), token_type: 'Bearer', expires_in: ACCESS_S, refresh_token: refreshToken }
}

export async function exchangeToken (form) {
  const grant = form.get('grant_type')
  if (grant === 'refresh_token') return rotateRefresh(form.get('refresh_token'))
  if (grant !== 'authorization_code') throw oauthError('unsupported_grant_type', 'Unsupported grant_type')
  const code = form.get('code')
  const row = await takeGrant('agentOauthCodes', code)
  if (!row || row.exp < Date.now()) throw oauthError('invalid_grant', 'Authorization code expired')
  if (row.clientId !== form.get('client_id') || row.redirectUri !== form.get('redirect_uri')) {
    throw oauthError('invalid_grant', 'Authorization code does not match this client')
  }
  if (!pkce(form.get('code_verifier') || '', row.challenge)) throw oauthError('invalid_grant', 'PKCE verification failed')
  return issueTokens(row.uid)
}

async function takeGrant (collection, id) {
  if (!id || !firestore()) return null
  const ref = firestore().collection(collection).doc(id)
  return firestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists) return null
    tx.delete(ref)
    return snap.data()
  })
}

async function rotateRefresh (refreshToken) {
  const row = await takeGrant('agentRefreshTokens', refreshToken)
  if (!row || row.exp < Date.now()) throw oauthError('invalid_grant', 'Refresh token expired')
  return issueTokens(row.uid)
}
