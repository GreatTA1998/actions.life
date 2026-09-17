import { activeView } from '$lib/store'

export const NATIVE_SOAK_URL = 'life.actions.app://soak'

export async function consumeSoakUrl (rawUrl) {
  if (!rawUrl || !rawUrl.startsWith(NATIVE_SOAK_URL)) return false

  let parsed
  try {
    parsed = new URL(rawUrl)
  } catch {
    return false
  }

  const action = parsed.searchParams.get('action')

  switch (action) {
    case 'settings':
      activeView.set('SETTINGS')
      return true
    case 'photos':
      activeView.set('PHOTOS')
      return true
    case 'calendar':
      activeView.set('CALENDAR')
      return true
    case 'google': {
      const { startNativeGoogleSignIn } = await import('./googleOAuth.js')
      await startNativeGoogleSignIn()
      return true
    }
    case 'photo-picker': {
      const { selectImages } = await import('./photos.js')
      await selectImages()
      return true
    }
    case 'gcal': {
      activeView.set('SETTINGS')
      const { requestNativeGoogleAuthCode, NATIVE_OAUTH_STATE_GCAL } = await import('./googleOAuth.js')
      await requestNativeGoogleAuthCode({ state: NATIVE_OAUTH_STATE_GCAL })
      return true
    }
    default:
      return false
  }
}
