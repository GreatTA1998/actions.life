import { cloudFunction } from '$lib/utils/cloudFunctions.js'

/**
 * Initiates the Google OAuth2 Authorization Code Flow.
 * @param {string} clientId - Your Google Cloud Client ID.
 * @param {string} scope - Space-separated list of scopes.
 * @returns {Promise<void>}
 */
export function initiateGoogleConnect (clientId, scope = 'https://www.googleapis.com/auth/calendar openid email') {
  return new Promise((resolve, reject) => {
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
      reject(new Error('Google Identity Services script not loaded.'))
      return
    }

    const client = google.accounts.oauth2.initCodeClient({
      client_id: clientId,
      scope: scope,
      ux_mode: 'popup',
      callback: async (response) => {
        if (response.code) {
          try {
            await cloudFunction('exchangeGoogleCode', { code: response.code })
            resolve()
          } catch (error) {
            console.error('Error exchanging code:', error)
            reject(error)
          }
        } else if (response.error) {
          console.error('GIS Error:', response.error)
          reject(new Error(response.error))
        } else {
          console.error('Unknown callback error, response =', response)
          reject(new Error('Unknown callback error'))
        }
      },
      error_callback: (error) => {
        console.error('GIS Error Callback:', error);
        reject(new Error(error.type === 'popup_closed' ? 'Authorization cancelled' : error.message));
      }
    })

    client.requestCode()
  })
}

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