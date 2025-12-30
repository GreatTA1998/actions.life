<script>
  import { initiateGoogleConnect, loadGoogleIdentityServices } from '$lib/utils/googleGIS'
  import GoogleIdentityButton from '$lib/components/GoogleIdentityButton.svelte'
  import { user } from '$lib/store'
  
  // TODO: Replace with your actual Client ID or import from a config file
  // Ideally, expose this via a public environment variable in SvelteKit ($env/static/public)
  let { clientId = 'YOUR_CLIENT_ID_HERE' } = $props() 

  let loading = $state(false)
  let error = $state(null)

  let isConnected = $derived($user.google?.refreshToken)

  async function handleConnect() {
    loading = true;
    error = null;
    try {
      await loadGoogleIdentityServices()
      await initiateGoogleConnect(clientId)
      alert('Successfully connected Google Calendar!')
    } catch (err) {
      console.error(err)
      error = err.message
    } finally {
      loading = false
    }
  }
</script>

<div class="buttons">
  {#if !isConnected}
    <button class="connect-btn" onclick={handleConnect} disabled={loading}>
      {#if loading}
        Connecting...
      {:else}
        <span class="icon">
          <!-- Google 'G' Logo SVG -->
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
              <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
              <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
              <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.769 -21.864 51.959 -21.864 51.129 C -21.864 50.299 -21.734 49.489 -21.484 48.729 L -21.484 45.639 L -25.464 45.639 C -26.254 47.219 -26.694 49.119 -26.694 51.129 C -26.694 53.139 -26.254 55.039 -25.464 56.619 L -21.484 53.529 Z" />
              <path fill="#EA4335" d="M -14.754 43.769 C -12.984 43.769 -11.404 44.379 -10.154 45.579 L -6.714 42.139 C -8.804 40.189 -11.514 38.999 -14.754 38.999 C -19.444 38.999 -23.494 41.699 -25.464 45.639 L -21.484 48.729 C -20.534 45.879 -17.884 43.769 -14.754 43.769 Z" />
            </g>
          </svg>
        </span>
        Connect Google Calendar
      {/if}
    </button>
  {:else}
    <div class="connected-status">
      <span class="checkmark">✓</span>
      <GoogleIdentityButton name="Successfully connected" onclick={() => {}} disabled/>
    </div>
  {/if}
</div>

{#if error}
  <p class="error">{error}</p>
{/if}

<style>
  .connect-btn {
    width: fit-content;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background-color: white;
    color: #3c4043;
    border: 1px solid #dadce0;
    border-radius: 4px;
    padding: 8px 16px;
    font-weight: 500;
    font-size: 0.875rem;
    transition: background-color 0.2s, box-shadow 0.2s;
  }

  .connect-btn:hover {
    background-color: #f7f8f8;
    box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
  }

  .connect-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  
  .icon {
    display: flex;
    align-items: center;
  }

  .error {
    color: red;
    font-size: 12px;
    margin-top: 4px;
  }

  .fetch-calendars-btn {
    background-color: #1a73e8;
    color: white;
    border: 1px solid #1a73e8;
    border-radius: 4px;
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }
  
  .fetch-calendars-btn:hover {
    background-color: #1765cc;
  }

  .fetch-calendars-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .connected-status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--success-color);
    font-weight: 500;
    font-size: 0.875rem;
  }

  .connected-status .checkmark {
    font-size: 1.125rem;
  }
</style>