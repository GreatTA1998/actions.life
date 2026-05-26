<script>
  import { loadGoogleIdentityServices } from '$lib/features/google-calendar/GIS.js'
  import GoogleIdentityButton from '$lib/components/GoogleIdentityButton.svelte'
  import { cloudFunction } from '$lib/utils/cloudFunctions.js'
  import GCalAccount from '$lib/db/models/GCalAccount.js'
  
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
        const { data: { email, id, token } } = await cloudFunction('exchangeGoogleCode', { code })
        GCalAccount.create(email, id, token)
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
