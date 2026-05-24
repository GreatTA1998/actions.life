import { cloudFunction } from '$lib/utils/cloudFunctions.js'
import { firebaseAuth } from '$lib/store'
import { get } from 'svelte/store'
import {
  AuthErrorCodes,
  GoogleAuthProvider,
  linkWithCredential,
  signInWithCredential,
} from 'firebase/auth'
import User from '$lib/db/models/User.js'
import { ensureAnonymousSession } from '$lib/auth/anonymous.js'

export const GOOGLE_CLIENT_ID =
  '132745397287-aakar5npr4orq496580pdgpvqeupf6j5.apps.googleusercontent.com'

const OAUTH_STORAGE_KEY = 'google_oauth_pending'

const SCOPES = {
  login: 'openid email profile',
  calendar: 'https://www.googleapis.com/auth/calendar openid email',
}

export function getGoogleRedirectUri () {
  return `${window.location.origin}/auth/google/callback`
}

export function loadGoogleIdentityServices () {
  if (typeof google !== 'undefined' && google.accounts?.oauth2) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = resolve
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script.'))
    document.head.appendChild(script)
  })
}

function savePendingOAuth (pending) {
  sessionStorage.setItem(OAUTH_STORAGE_KEY, JSON.stringify(pending))
}

function consumePendingOAuth () {
  const raw = sessionStorage.getItem(OAUTH_STORAGE_KEY)
  sessionStorage.removeItem(OAUTH_STORAGE_KEY)
  if (!raw) throw new Error('OAuth session expired. Please try again.')
  return JSON.parse(raw)
}

async function exchangeCode (code, redirect_uri) {
  const { data } = await cloudFunction('exchangeGoogleCode', { code, redirect_uri })
  return data
}

/** Full-page redirect to Google (WebKit-safe). Resumes on /auth/google/callback. */
export async function startGoogleAuth (flow, { returnTo } = {}) {
  if (flow === 'login') await ensureAnonymousSession()
  await loadGoogleIdentityServices()

  const state = crypto.randomUUID()
  savePendingOAuth({ flow, state, returnTo: returnTo || null })

  google.accounts.oauth2.initCodeClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES[flow],
    ux_mode: 'redirect',
    redirect_uri: getGoogleRedirectUri(),
    state,
  }).requestCode()
}

/** GIS sign-in: anonymous first, then link Google on callback (same uid). */
export function signInWithGoogle () {
  return startGoogleAuth('login')
}

export function connectGoogleCalendar () {
  const returnTo = typeof window !== 'undefined' ? window.location.pathname : null
  return startGoogleAuth('calendar', { returnTo })
}

export async function completeGoogleAuth (code, urlState) {
  const { flow, state, returnTo } = consumePendingOAuth()
  if (urlState !== state) throw new Error('Invalid OAuth state')

  const redirect_uri = getGoogleRedirectUri()
  const { idToken } = await exchangeCode(code, redirect_uri)
  const auth = get(firebaseAuth)

  if (flow === 'login') {
    const credential = GoogleAuthProvider.credential(idToken)
    try {
      await linkWithCredential(auth.currentUser, credential)
    } catch (e) {
      if (e.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
        await signInWithCredential(auth, credential)
      } else throw e
    }
    await User.update({ email: auth.currentUser.email })
  }

  return { redirectTo: returnTo || `/${auth.currentUser.uid}` }
}
