import { exchangeGoogleCode } from './cloudFunctions';

/**
 * Initiates the Google OAuth2 Authorization Code Flow.
 * @param {string} clientId - Your Google Cloud Client ID.
 * @param {string} scope - Space-separated list of scopes.
 * @returns {Promise<void>}
 */
export function initiateGoogleConnect (clientId, scope = 'https://www.googleapis.com/auth/calendar') {
  return new Promise((resolve, reject) => {
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
      reject(new Error('Google Identity Services script not loaded.'))
      return;
    }

    const client = google.accounts.oauth2.initCodeClient({
      client_id: clientId,
      scope: scope,
      ux_mode: 'popup',
      callback: async (response) => {
        if (response.code) {
          try {
            console.log('Received auth code, exchanging for tokens...')
            await exchangeGoogleCode({ code: response.code })
            console.log('Token exchange successful.')
            resolve()
          } catch (error) {
            console.error('Error exchanging code:', error)
            reject(error);
          }
        } else if (response.error) {
          console.error('GIS Error:', response.error)
          reject(new Error(response.error));
        } else {
            // User closed popup or cancelled
            console.log('User cancelled or no code returned')
            // We might not want to reject here, just resolve or do nothing.
            // But for a Promise, we usually want to know it finished.
            reject(new Error('Authorization cancelled'))
        }
      },
    });

    client.requestCode()
  });
}

export function loadGoogleIdentityServices () {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = () => reject(new Error('Failed to load Google Identity Services script.'))
    document.head.appendChild(script)
  })
}

