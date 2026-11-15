/**
 * Local-first store (Supabase / PowerSync direction).
 *
 * - In-memory forest is source of truth for UI
 * - Mutations apply optimistically, then a single IDB write persists the snapshot
 * - "Sync" is a separate queue that can be paused to simulate offline
 *
 * This is the architecture you'd pair with Supabase (or any sync backend):
 * local correctness first, network second — instead of Firestore's
 * "await remote/IDB persistence before the UI updates" model.
 */

import { openDb, reqToPromise, txDone } from './idb.js'

const DB_NAME = 'pwa-lab-local-first'
const STORE = 'snapshot'

/** @typedef {{ id: string, name: string, parentID: string, rootID: string, orderValue: number, treeISOs: string[], startDateISO: string, updatedAt: number }} TaskDoc */

/** @type {TaskDoc[]} */
let memory = []

/** @type {{ id: string, at: number, payload: TaskDoc[] }[]} */
let syncQueue = []

let online = true
let syncTimer = null

/**
 * @returns {Promise<IDBDatabase>}
 */
function getDb () {
  return openDb(DB_NAME, 1, (db) => {
    if (!db.objectStoreNames.contains(STORE)) {
      db.createObjectStore(STORE, { keyPath: 'key' })
    }
  })
}

async function persistSnapshot () {
  const db = await getDb()
  const tx = db.transaction(STORE, 'readwrite')
  tx.objectStore(STORE).put({ key: 'tasks', value: memory, updatedAt: Date.now() })
  await txDone(tx)
}

export function setLocalFirstOnline (value) {
  online = value
  if (online) flushSyncQueue()
}

export function isLocalFirstOnline () {
  return online
}

export async function seedLocalFirstTree (size = 40) {
  const now = Date.now()
  const rootId = 'root'
  memory = [{
    id: rootId,
    name: 'Root',
    parentID: '',
    rootID: rootId,
    orderValue: 0,
    treeISOs: [],
    startDateISO: '',
    updatedAt: now
  }]
  for (let i = 0; i < size; i++) {
    memory.push({
      id: `task-${i}`,
      name: `Task ${i}`,
      parentID: rootId,
      rootID: rootId,
      orderValue: i + 1,
      treeISOs: [],
      startDateISO: '',
      updatedAt: now
    })
  }
  await persistSnapshot()
  enqueueSync()
  return memory.length
}

export async function loadLocalFirstFromDisk () {
  const db = await getDb()
  const tx = db.transaction(STORE, 'readonly')
  const row = await reqToPromise(tx.objectStore(STORE).get('tasks'))
  await txDone(tx)
  memory = row?.value ? structuredClone(row.value) : []
  return memory.length
}

export function listLocalFirst () {
  return memory.slice().sort((a, b) => a.orderValue - b.orderValue)
}

export function getSyncQueueLength () {
  return syncQueue.length
}

/**
 * Optimistic tree update: mutates memory immediately, persists one snapshot,
 * and queues a sync op (no-op when "offline").
 * @param {string} taskId
 * @param {string} newName
 * @param {string} [newDateISO]
 */
export async function localFirstUpdateTree (taskId, newName, newDateISO = '2026-08-26') {
  const task = memory.find((t) => t.id === taskId)
  if (!task) throw new Error(`Missing task ${taskId}`)

  const prevDate = task.startDateISO
  let treeISOs = [...task.treeISOs]
  if (prevDate) {
    const idx = treeISOs.indexOf(prevDate)
    if (idx >= 0) treeISOs = [...treeISOs.slice(0, idx), ...treeISOs.slice(idx + 1)]
  }
  if (newDateISO) treeISOs = [...treeISOs, newDateISO]

  const now = Date.now()
  memory = memory.map((node) => {
    if (node.rootID !== task.rootID) return node
    if (node.id === taskId) {
      return { ...node, name: newName, startDateISO: newDateISO, treeISOs, updatedAt: now }
    }
    return { ...node, treeISOs, updatedAt: now }
  })

  // Single snapshot write — O(1) IDB transactions regardless of tree size
  await persistSnapshot()
  enqueueSync()
  return memory.filter((n) => n.rootID === task.rootID).length
}

function enqueueSync () {
  syncQueue.push({
    id: `sync-${Date.now()}-${syncQueue.length}`,
    at: Date.now(),
    payload: structuredClone(memory)
  })
  if (online) flushSyncQueue()
}

function flushSyncQueue () {
  if (syncTimer) return
  syncTimer = setTimeout(() => {
    syncTimer = null
    if (!online) return
    // Simulate a successful remote ack (Supabase upsert batch)
    syncQueue = []
  }, 16)
}

export async function clearLocalFirst () {
  memory = []
  syncQueue = []
  const db = await getDb()
  const tx = db.transaction(STORE, 'readwrite')
  tx.objectStore(STORE).clear()
  await txDone(tx)
}
