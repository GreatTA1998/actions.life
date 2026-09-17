<script>
  import GoogleIdentityButton from '$lib/components/GoogleIdentityButton.svelte'
  import GCalAccount from '$lib/db/models/GCalAccount.js'
  import { loadGoogleIdentityServices } from '$lib/features/google-calendar/GIS.js'
  import { cloudFunction } from '$lib/utils/cloudFunctions.js'
  import { setupCalendarsOfAccount } from '$lib/features/google-calendar/gcal.js'
  
  // Ideally, expose this via a public environment variable in SvelteKit ($env/static/public)
  const client_id = '132745397287-aakar5npr4orq496580pdgpvqeupf6j5.apps.googleusercontent.com'
  const scope = 'openid email https://www.googleapis.com/auth/calendar.readonly'
  
  let loading = $state(false)

  async function handleConnect () {
    loading = true
    try {
      const { Capacitor } = await import('@capacitor/core')
      if (Capacitor.isNativePlatform()) {
        const { requestNativeGoogleAuthCode, NATIVE_OAUTH_STATE_GCAL } = await import('$lib/native/googleOAuth.js')
        const { code, redirectUri } = await requestNativeGoogleAuthCode({ state: NATIVE_OAUTH_STATE_GCAL })
        await connectWithCode(code, redirectUri)
        return
      }

      await loadGoogleIdentityServices()

      const client = google.accounts.oauth2.initCodeClient({
        client_id, scope,
        ux_mode: 'popup',
        callback: async ({ code }) => {
          try {
            await connectWithCode(code)
          } finally {
            loading = false
          }
        }
      })

      client.requestCode()
    } catch (error) {
      loading = false
      throw error
    }
  }

  async function connectWithCode (code, redirectUri) {
    const { 
      data: { tokens, email, id } 
    } = await cloudFunction('exchangeForTokens', {
      authorizationCode: code,
      ...(redirectUri ? { redirect_uri: redirectUri } : {})
    }) 
    
    await GCalAccount.create(email, id, tokens)
    setupCalendarsOfAccount(tokens.refresh_token, id)
    loading = false
  }
</script>

<GoogleIdentityButton onclick={handleConnect}
  name={loading ? 'Connecting...' : 'Integration'} disabled={loading}
  ariaLabel="Add Calendar"
  svgSize="18px"
  extraStyle="
    width: fit-content;
    border-radius: 4px;
    color: #3c4043;
    font-family: inherit;
    background-color: white;
    border: 1px solid #dadce0;
    height: fit-content;
    padding: 8px 16px;
    vertical-align: baseline;
  "
/>
