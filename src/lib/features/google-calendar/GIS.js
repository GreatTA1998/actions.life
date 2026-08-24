import { page } from '$app/state'

export function loadGoogleIdentityServices () {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = resolve
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script.'))
    document.head.appendChild(script)
  })
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