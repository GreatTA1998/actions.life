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

export const GOOGLE_CLIENT_ID =
  '132745397287-aakar5npr4orq496580pdgpvqeupf6j5.apps.googleusercontent.com'

const SCOPES = {
  login: 'openid email profile',
  calendar: 'https://www.googleapis.com/auth/calendar openid email',
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

function requestGoogleAuthCode (scope) {
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initCodeClient({
      client_id: GOOGLE_CLIENT_ID,
      scope,
      ux_mode: 'popup',
      callback: (response) => {
        if (response.code) resolve(response.code)
        else reject(new Error(response.error || 'Authorization failed'))
      },
      error_callback: (error) => {
        reject(new Error(error.type === 'popup_closed' ? 'Authorization cancelled' : error.message))
      },
    })
    client.requestCode()
  })
}

async function exchangeCode (code) {
  const { data } = await cloudFunction('exchangeGoogleCode', { code })
  return data
}

export async function signInWithGoogle () {
  await loadGoogleIdentityServices()
  const { idToken, email } = await exchangeCode(await requestGoogleAuthCode(SCOPES.login))
  const auth = get(firebaseAuth)
  const credential = GoogleAuthProvider.credential(idToken)
  try {
    await linkWithCredential(auth.currentUser, credential)
  } catch (e) {
    if (e.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
      await signInWithCredential(auth, credential)
    } else throw e
  }
  await User.update({ email })
}

export async function connectGoogleCalendar () {
  await loadGoogleIdentityServices()
  await exchangeCode(await requestGoogleAuthCode(SCOPES.calendar))
}
