<script>
  import CommunityChat from '$lib/components/CommunityChat/index.svelte'
  import ModeSettings from './ModeSettings.svelte'
  import ColorSettings from './ColorSettings.svelte'
  import PhotoSettings from './PhotoSettings.svelte'
  import GridlineSettings from './GridlineSettings.svelte'
  import DataExport from './DataExport/index.svelte'
  import AddAccount from '$lib/features/google-calendar/AddAccount.svelte'
  import GCalDashboard from '$lib/features/google-calendar/GCalDashboard.svelte'
  import GithubButton from '$lib/components/GithubButton.svelte'
  import MslLogout from 'virtual:icons/material-symbols-light/logout'
  import { signOut } from 'firebase/auth'
  import { firebaseAuth } from '$lib/store'

  async function handleLogoClick() {
    await signOut($firebaseAuth)
    window.location.href = '/'
  }

  let statusMessage = $state('')
</script>

<div class="settings-container"> 
  <div class="settings-content">
    <div style="flex: 1; display: flex; flex-direction: column; gap: 12px;">
      <CommunityChat />

      <div class="settings-group" style="display: flex; flex-direction: column; row-gap: 12px;">
        <div style="display: flex; column-gap: 12px; align-items: center;">
          <div class="title">App</div>
          
          <ColorSettings />
        </div>
        <ModeSettings />
      </div>
   
      <div class="flex flex-col gap-y-4">
        <div class="flex flex-col gap-y-6 settings-group">
          <div class="title">Calendar</div>
          <GridlineSettings />

          <div class="grid flex-col gap-2">          
            <GCalDashboard />

            <AddAccount />
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; row-gap: 16px;" class="settings-group">
        <div class="flex items-center gap-x-3">
          <div class="title">Data</div>
          <span class="status">{statusMessage}</span>
        </div>
        <DataExport onFinish={message => statusMessage = message}/>
      </div>

      <div style="display: flex; flex-direction: column; row-gap: 16px;" class="settings-group">
        <div class="title">Photo</div>
        <PhotoSettings />
      </div>
    </div>
  </div>
  
  <div class="footer">
    <GithubButton />

    <button onclick={handleLogoClick} class="logout-button">
      <MslLogout style="font-size: 1.4rem;"/>
      <span>Sign out</span>
    </button>
  </div>
</div>

<style>
  .status {
    color: var(--success-color);
    font-size: 0.875rem;
  }

  .settings-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background: rgb(235, 235, 235);
    overflow-y: auto;
  }

  .settings-group {
    padding: 16px;
    background: var(--navbar-bg-color);
  }

  .title {
    font-size: 1rem;
    font-weight: 600;
  }

  .settings-content {
    display: flex;
    flex-direction: row;
    gap: 80px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }


  .settings-description {
    font-size: 0.875rem;
    margin-bottom: 24px;
    line-height: 1.6;
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 24px 64px;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .logout-button {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #6b6b6b;
    font-weight: 500;
    padding: 6px 12px;
  }
</style>