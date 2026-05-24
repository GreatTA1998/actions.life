<script>
  import { connectGoogleCalendar } from '$lib/features/google-calendar/GIS.js'
  import GoogleIdentityButton from '$lib/components/GoogleIdentityButton.svelte'

  let loading = $state(false)
  let error = $state('')

  async function handleConnect () {
    loading = true
    error = ''
    try {
      await connectGoogleCalendar()
    } catch (err) {
      console.error(err)
      error = err.message
      loading = false
    }
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

{#if error}
  <p class="text-red text-md">{error}</p>
{/if}
