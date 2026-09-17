import { Capacitor } from '@capacitor/core'
import { goto } from '$app/navigation'
import * as staticPublic from '$env/static/public'

export const GOOGLE_WEB_CLIENT_ID = '132745397287-aakar5npr4orq496580pdgpvqeupf6j5.apps.googleusercontent.com'
export const GOOGLE_OAUTH_SCOPES = 'openid email https://www.googleapis.com/auth/calendar.readonly'

const PRODUCTION_NATIVE_OAUTH_REDIRECT = 'https://actions.life/auth/callback'

/**
 * HTTPS redirect already registered for the web GIS client.
 * Local native builds: set PUBLIC_NATIVE_OAUTH_REDIRECT in gitignored `.env.local`
 * (Vite loadEnv + $env/static/public inline it during `npm run build:native`).
 * Do not rely on `$env/dynamic/public` — adapter-static often leaves that empty
 * even when the shell exported the var.
 */
export const NATIVE_OAUTH_HTTPS_REDIRECT = resolveNativeOauthHttpsRedirect()

function resolveNativeOauthHttpsRedirect () {
  const candidates = [
    staticPublic.PUBLIC_NATIVE_OAUTH_REDIRECT,
    import.meta.env.PUBLIC_NATIVE_OAUTH_REDIRECT
  ]
  return candidates.find((value) => typeof value === 'string' && value.trim()) || PRODUCTION_NATIVE_OAUTH_REDIRECT
}

/** Custom scheme the HTTPS callback bounces into so WKWebView is never the Google user-agent. */
export const NATIVE_OAUTH_APP_URL = 'life.actions.app://oauth'

export const NATIVE_OAUTH_STATE_SIGNIN = 'capacitor-signin'
export const NATIVE_OAUTH_STATE_GCAL = 'capacitor-gcal'

let listening = false
let pending = null
let browserFinishedBound = false

export function isNativeOAuthState (state) {
  return typeof state === 'string' && state.startsWith('capacitor')
}

export function shouldBounceOAuthToApp (state) {
  return isNativeOAuthState(state) && !Capacitor.isNativePlatform()
}

export function appOAuthUrlFromSearch (search) {
  const query = search.startsWith('?') ? search : `?${search}`
  return `${NATIVE_OAUTH_APP_URL}${query}`
}

export async function startNativeGoogleSignIn () {
  const { code, redirectUri } = await requestNativeGoogleAuthCode({ state: NATIVE_OAUTH_STATE_SIGNIN })
  const params = new URLSearchParams({
    code,
    oauth_redirect: redirectUri,
    state: NATIVE_OAUTH_STATE_SIGNIN
  })
  await goto(`/auth/callback?${params}`)
}

export async function requestNativeGoogleAuthCode ({ state = NATIVE_OAUTH_STATE_SIGNIN } = {}) {
  const { Browser } = await import('@capacitor/browser')
  await ensureOAuthListener()

  const redirectUri = NATIVE_OAUTH_HTTPS_REDIRECT
  const authUrl = googleAuthorizeUrl({ state, redirectUri })
  console.info('[native oauth] Google authorize redirect_uri=', redirectUri)

  const result = new Promise((resolve, reject) => {
    pending = { resolve, reject, redirectUri }
  })

  try {
    await bindBrowserFinished(Browser)
    await Browser.open({
      url: authUrl,
      windowName: '_blank',
      presentationStyle: 'fullscreen'
    })
    return await result
  } catch (error) {
    pending = null
    throw error
  }
}

async function bindBrowserFinished (Browser) {
  if (browserFinishedBound) return
  browserFinishedBound = true
  Browser.addListener('browserFinished', () => {
    // appUrlOpen usually wins; delay so a successful bounce is not treated as cancel.
    setTimeout(() => {
      if (!pending) return
      pending.reject(new Error('Google sign-in was closed'))
      pending = null
    }, 400)
  })
}

export async function listenForNativeOAuth () {
  await ensureOAuthListener()
}

async function ensureOAuthListener () {
  if (listening || !Capacitor.isNativePlatform()) return
  listening = true

  const { App } = await import('@capacitor/app')

  App.addListener('appUrlOpen', ({ url }) => {
    handleNativeOpenUrl(url)
  })

  try {
    const launch = await App.getLaunchUrl()
    if (launch?.url) handleNativeOpenUrl(launch.url)
  } catch {
    // getLaunchUrl is optional; appUrlOpen still covers warm returns
  }
}

function handleNativeOpenUrl (rawUrl) {
  if (!rawUrl) return
  if (rawUrl.startsWith('life.actions.app://soak')) {
    import('./soak.js').then(({ consumeSoakUrl }) => consumeSoakUrl(rawUrl)).catch(() => {})
    return
  }
  consumeOAuthReturnUrl(rawUrl)
}

function consumeOAuthReturnUrl (rawUrl) {
  if (!rawUrl || !rawUrl.startsWith(NATIVE_OAUTH_APP_URL)) return

  let parsed
  try {
    parsed = new URL(rawUrl)
  } catch {
    return
  }

  const code = parsed.searchParams.get('code')
  const error = parsed.searchParams.get('error')
  import('@capacitor/browser').then(({ Browser }) => Browser.close().catch(() => {}))

  if (error) {
    pending?.reject(new Error(error))
    pending = null
    return
  }

  if (!code) {
    pending?.reject(new Error('Google sign-in returned no authorization code'))
    pending = null
    return
  }

  const redirectUri = pending?.redirectUri || NATIVE_OAUTH_HTTPS_REDIRECT
  if (pending) {
    pending.resolve({ code, redirectUri })
    pending = null
    return
  }

  // Cold start: app opened from the bounce URL with no in-flight request.
  const state = parsed.searchParams.get('state') || NATIVE_OAUTH_STATE_SIGNIN
  const params = new URLSearchParams({
    code,
    oauth_redirect: redirectUri,
    state
  })
  goto(`/auth/callback?${params}`)
}

function googleAuthorizeUrl ({ state, redirectUri }) {
  const params = new URLSearchParams({
    client_id: GOOGLE_WEB_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_OAUTH_SCOPES,
    state,
    access_type: 'offline',
    prompt: 'select_account consent',
    include_granted_scopes: 'true'
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}
