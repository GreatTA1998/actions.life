<script>
  import ColorSettings from './ColorSettings.svelte'
  import PhotoSettings from './PhotoSettings.svelte'
  import GridlineSettings from './GridlineSettings.svelte'
  import EmailDraft from './EmailDraft.svelte'
  import { getAuth, signOut } from 'firebase/auth'
  import { goto } from '$app/navigation'

  function handleLogoClick() {
    const auth = getAuth()
    signOut(auth).catch(console.error)
    goto('/')
  }
</script>

<div class="settings-container"> 
  <div class="settings-content">
    <div class="settings-main">
      <div class="settings-group">
        <div class="settings-label">Theme</div>
        <ColorSettings />
      </div>

      <div class="settings-group">
        <GridlineSettings />
      </div>

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
        
        <EmailDraft />
      </div>
    </div>
  </div>
  
  <div class="footer">
    <button on:click={handleLogoClick} class="logout-button">
      <span class="material-symbols-outlined">logout</span>
      <span>Log out to home tutorials</span>
    </button>
  </div>
</div>

<style>
  .settings-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    color: #3d3d3d;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: var(--offwhite-bg);
    overflow-y: auto;
  }

  .settings-content {
    display: flex;
    flex-direction: row;
    padding: 48px 64px;
    gap: 80px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .settings-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 48px;
  }

  .settings-side {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 48px;
    border-left: 1px solid #eaeaea;
    padding-left: 64px;
  }

  @media (max-width: 768px) {
    .settings-content {
      flex-direction: column;
      padding: 24px 20px;
      gap: 48px;
    }

    .settings-side {
      border-left: none;
      padding-left: 0;
      border-top: 1px solid #eaeaea;
      padding-top: 48px;
    }

    .footer {
      padding: 24px 20px;
    }
  }

  .settings-group {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .settings-label {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #555;
    letter-spacing: 0.1px;
  }

  .settings-description {
    font-size: 14px;
    color: #555;
    margin-bottom: 24px;
    line-height: 1.6;
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    padding: 24px 64px;
    border-top: 1px solid #eaeaea;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
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
  }

  .logout-button:hover {
    background: #f5f5f5;
  }

  .logout-button span {
    font-size: 16px;
  }
</style>