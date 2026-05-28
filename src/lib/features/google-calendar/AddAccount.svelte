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
    await loadGoogleIdentityServices()

    const client = google.accounts.oauth2.initCodeClient({
      client_id, scope,
      ux_mode: 'popup',
      callback: async ({ code }) => {
        const { 
          data: { tokens, email, id } 
        } = await cloudFunction('exchangeForTokens', { authorizationCode: code }) 
        
        await GCalAccount.create(email, id, tokens)
        setupCalendarsOfAccount(tokens.refresh_token, id)
      }
    })

    client.requestCode()
  }
</script>

<GoogleIdentityButton onclick={handleConnect}
  name={loading ? 'Connecting...' : 'Integration'} disabled={loading}
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