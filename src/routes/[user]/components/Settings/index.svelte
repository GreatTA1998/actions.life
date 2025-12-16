<script>
  import ColorSettings from './ColorSettings.svelte'
  import PhotoSettings from './PhotoSettings.svelte'
  import GridlineSettings from './GridlineSettings.svelte'
  import EmailDraft from './EmailDraft.svelte'
  import ConnectGoogleCalendar from '$lib/components/ConnectGoogleCalendar.svelte'
  import GoogleCalendarSelector from '$lib/components/GoogleCalendarSelector.svelte'
  import { getAuth, signOut } from 'firebase/auth'
  import { goto } from '$app/navigation'
  import { user } from '$lib/store'

  function handleLogoClick() {
    const auth = getAuth()
    signOut(auth).catch(console.error)
    goto('/')
  }
</script>

<div class="settings-container"> 
  <div class="settings-content">
    <div class="settings-main">
      <div style="display: grid; flex-direction: column; gap: 8px;">
        <div style="font-size: 15px; font-weight: 600; color: #555; letter-spacing: 0.1px;">
          Integrations
        </div>

        <ConnectGoogleCalendar clientId="132745397287-aakar5npr4orq496580pdgpvqeupf6j5.apps.googleusercontent.com" />
       
        {#if $user.google?.refreshToken}
          <GoogleCalendarSelector />
        {/if}
      </div>

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
    <div style="margin-left: auto; margin-right: 12px;">
      <a
        href="https://github.com/GreatTA1998/intentions.life"
        target="_blank"
        rel="noreferrer"
        class="github-link"
        title="View on GitHub"
      >
        <svg width="20" height="20" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="#24292f"/>
        </svg>
      </a>
    </div>

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
    color: #555;
    letter-spacing: 0.1px;
    margin-bottom: 16px;
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