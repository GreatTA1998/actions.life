<script>
  import { initiateGoogleConnect, loadGoogleIdentityServices } from '$lib/features/google-calendar/GIS.js'
  import GoogleIdentityButton from '$lib/components/GoogleIdentityButton.svelte'
  
  // Ideally, expose this via a public environment variable in SvelteKit ($env/static/public)
  const clientId = '132745397287-aakar5npr4orq496580pdgpvqeupf6j5.apps.googleusercontent.com'
  let loading = $state(false)
  let error = $state('')

  async function handleConnect() {
    loading = true
    error = ''
    try {
      await loadGoogleIdentityServices()
      await initiateGoogleConnect(clientId)
      window.location.reload()
    } catch (err) {
      console.error(err)
      error = err.message
    } finally {
      console.log('finally clause')
      loading = false
    }
  }
</script>

<GoogleIdentityButton onclick={handleConnect}
  name={loading ? 'Connecting...' : 'Add Calendar Account'} disabled={loading}
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

{#if error}
  <p class="text-red text-md">{error}</p>
{/if}
