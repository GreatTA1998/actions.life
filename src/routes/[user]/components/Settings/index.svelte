<script>
  import ColorSettings from './ColorSettings.svelte'
  import TimeRangeSettings from './TimeRangeSettings.svelte'
  import GridlineSettings from './GridlineSettings.svelte'
  import PhotoSettings from './PhotoSettings.svelte'
  import BasePopup from '$lib/components/BasePopup.svelte'
  import { showSnackbar, closeSettings } from '$lib/store'
  import { getAuth, signOut } from 'firebase/auth'
  import { goto } from '$app/navigation'

  function copyEmailToClipboard () {
    navigator.clipboard.writeText('elton@explanations.io')
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

<BasePopup on:click-outside={closeSettings} zIndex={6} padding={0}>
  <div class="settings-container"> 
    <div class="settings-header">Settings</div>

    <div class="settings-content">
      <div class="settings-main">
        <div class="settings-group">
          <div class="settings-label">Theme</div>
          <div class="color-options">
            <ColorSettings />
          </div>
        </div>

        <!-- <div class="settings-group">
          <div class="settings-label">Calendar Hours</div>
          <TimeRangeSettings />
        </div> -->
        
        <!-- <div class="settings-group">
          <div class="settings-label">Gridlines</div>
          <GridlineSettings />
        </div> -->

        <div class="settings-group">
          <div class="settings-label">Photos</div>
          <PhotoSettings />
        </div>
      </div>
      
      <div class="settings-side">
        <div class="settings-group">
          <div class="settings-label">Support</div>
          <div class="settings-description">
            My job is to fix issues you have quickly. I'm also hoping for advice on how to 
            improve this calendar.
          </div>
          <div class="email-container">
            <span class="material-symbols-outlined email-icon">mail</span>
            <div class="email-address">elton@explanations.io</div>
            <button on:click={copyEmailToClipboard} class="copy-button">
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <button on:click={handleLogoClick} class="logout-button">
        <span class="material-symbols-outlined">logout</span>
        <span>Log out</span>
      </button>
    </div>
  </div>
</BasePopup>

<style>
  .settings-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    color: #3d3d3d;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  .settings-header {
    font-size: 18px;
    font-weight: 600;
    padding: 16px 20px;
    border-bottom: 1px solid #eaeaea;
  }

  .settings-content {
    display: flex;
    padding: 20px;
    gap: 40px;
  }

  .settings-main {
    flex: 2;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .settings-side {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
    border-left: 1px solid #eaeaea;
    padding-left: 40px;
  }

  .settings-group {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .settings-label {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #6b6b6b;
  }

  .settings-description {
    font-size: 13px;
    color: #6b6b6b;
    margin-bottom: 12px;
    line-height: 1.4;
  }

  .color-options {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 12px;
  }

  .email-container {
    display: flex;
    align-items: center;
    margin-top: 4px;
  }

  .email-icon {
    font-size: 14px;
    color: #6b6b6b;
    margin-right: 8px;
  }

  .email-address {
    font-size: 13px;
    color: #6b6b6b;
  }

  .copy-button {
    background: transparent;
    border: 1px solid #6b6b6b;
    color: #6b6b6b;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;
    padding: 4px 10px;
    margin-left: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .copy-button:hover {
    background: #f5f5f5;
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid #eaeaea;
  }

  .logout-button {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: none;
    color: #6b6b6b;
    font-size: 13px;
    font-weight: 500;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .logout-button:hover {
    background: #f5f5f5;
  }

  .logout-button span {
    font-size: 16px;
  }
</style>