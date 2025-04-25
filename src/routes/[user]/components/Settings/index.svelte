<script>
  import { showSnackbar, user } from '/src/lib/store'
  import BasePopup from '$lib/components/BasePopup.svelte'
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
  <BasePopup on:click-outside={() => isPopupOpen = false} zIndex={6}>
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
  </BasePopup>
{/if}