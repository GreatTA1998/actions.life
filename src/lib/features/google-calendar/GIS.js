import { page } from '$app/state'

let gsiPromise = null

export function loadGoogleIdentityServices () {
  if (typeof google !== 'undefined' && google.accounts?.oauth2) {
    return Promise.resolve()
  }
  if (gsiPromise) return gsiPromise

  gsiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = resolve
    script.onerror = () => {
      gsiPromise = null
      reject(new Error('Failed to load Google Identity Services script.'))
    }
    document.head.appendChild(script)
  })
  return gsiPromise
}

/** Warm the GIS script before the user clicks Sign in (redirect UX). */
export function preloadGoogleIdentityServices () {
  if (typeof document === 'undefined') return
  loadGoogleIdentityServices().catch(() => {})
}

export async function requestGoogleSignIn () {
  await loadGoogleIdentityServices()
  const client = google.accounts.oauth2.initCodeClient({
    client_id: '132745397287-aakar5npr4orq496580pdgpvqeupf6j5.apps.googleusercontent.com',
    scope: 'openid email https://www.googleapis.com/auth/calendar.readonly',
    ux_mode: 'redirect',
    redirect_uri: page.url.origin + '/auth/callback',
  })
  client.requestCode()
}
