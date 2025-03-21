<script>
  import { showSnackbar, user } from '/src/store'
  import { clickOutside } from '/src/utils/svelteActions.js'
  import ColorSettings from './ColorSettings.svelte'
  import TimeRangeSettings from './TimeRangeSettings.svelte'
  import GridlineSettings from './GridlineSettings.svelte'
  import PhotoSettings from './PhotoSettings.svelte'
  import { getAuth, signOut } from 'firebase/auth'
  import { goto } from '$app/navigation'

  let isPopupOpen = false

  function setIsPopupOpen ({ newVal }) {
    isPopupOpen = newVal
  }

  function copyEmailToClipboard () {
    navigator.clipboard.writeText("martsyalis@gmail.com")
    showSnackbar.set(true)
    setTimeout(() => showSnackbar.set(false), 3000)
  }

  function handleLogoClick() {
    if (confirm('Log out and return to home page tutorials?')) {
      const auth = getAuth()
      signOut(auth).catch(console.error)
      goto('/')
    }
  }
</script>

<slot {setIsPopupOpen}>

</slot>

{#if isPopupOpen}
  <div class="fullscreen-invisible-modular-popup-layer">
    <div class="detailed-card-popup" use:clickOutside on:click_outside={() => isPopupOpen = false}>
      <ColorSettings />

      <TimeRangeSettings />

      <GridlineSettings />

      <PhotoSettings/>

      <div style="display: flex; align-items: center;">
        <div style="font-size: 20px;">Extremely good customer support</div>
      </div>

      <div style="display: flex; align-items: center;">
        <span class="material-symbols-outlined" style="margin-right: 6px;">
          mail
        </span>

        <div style="font-weight: 500; margin-right: 12px;">
          elton@explanations.io
        </div>

        <button on:click={copyEmailToClipboard} style="color: #cc7837; border-radius: 24px; border: 2px solid #cc7837; cursor: pointer; display: flex; align-items: center; padding: 6px 8px; font-size: 24px;">
          <div style="font-size: 14px; margin-right: 4px; color: #cc7837; font-weight: 600;">
            Copy email
          </div>
          <span class="material-symbols-outlined">
            content_copy
          </span>
        </button>
      </div>

      <!-- Log-out -->
      <button 
        on:click={handleLogoClick}
        style="width: 80px; cursor: pointer; display: flex; align-items: center; padding: 6px 8px; font-size: 24px;"
      >
        <div style="font-size: 14px; margin-right: 4px; font-weight: 600;">
          Log out
        </div>
        <span class="material-symbols-outlined">
          logout
        </span>
      </button>
    </div>
  </div>
{/if}

<style>
  .detailed-card-popup {
    position: fixed;
    font-size: 14px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 58%;
    overflow-y: auto;
    z-index: 6;
    min-width: 360px;
    
    height: fit-content;

    padding: 24px;
    border-radius: 24px;
    background-color: white;

    display: flex; 
    flex-direction: column;
    row-gap: 24px;
 
  /*    border: 1px solid #000; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);*/
    -webkit-box-shadow:  0px 0px 0px 9999px rgba(0, 0, 0, 0.5);
  }
</style>