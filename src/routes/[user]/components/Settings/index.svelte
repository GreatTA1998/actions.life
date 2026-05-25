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
  import { firebaseAuth, allAccounts } from '$lib/store'

  async function handleLogoClick() {
    await signOut($firebaseAuth)
    window.location.href = '/'
  }

  let statusMessage = $state('')
</script>

<div class="flex flex-col size-full overflow-y-auto bg-[rgb(235,235,235)]"> 
  <div style="display: flex; flex-direction: column; gap: 12px;" class="flex">
    <div class="settings-group">
      <div class="flex gap-x-3 items-center">
        <div class="title">App</div>
        
        <ColorSettings />
      </div>
      <ModeSettings />
    </div>
  
    <div class="settings-group">
      <div class="flex flex-col gap-y-6">

        <div class="flex gap-x-3 items-center">
          <div class="title">Calendar</div>
          <AddAccount />
        </div>

        <GridlineSettings />
        
        {#if $allAccounts.length > 0}
          <GCalDashboard />
        {/if}
      </div>
    </div>

    <div class="settings-group">
      <div class="flex items-center gap-x-3">
        <div class="title">Data</div>
        <span class="text-sm text-[var(--success-color)]">{statusMessage}</span>
      </div>

      <DataExport onFinish={message => statusMessage = message}/>
    </div>

    <div class="settings-group">
      <div class="title">Photo</div>
      <PhotoSettings />
    </div>

    <div class="shrink-0">
      <CommunityChat />
    </div>

    <div class="flex items-center justify-end py-6">
      <GithubButton />
  
      <button onclick={handleLogoClick} class="flex items-center gap-1.5 text-[#6b6b6b] font-medium py-1.5 px-3">
        <MslLogout style="font-size: 1.4rem;"/>
        <span>Sign out</span>
      </button>
    </div>
  </div>
</div>

<style>
  .settings-group {
    flex-shrink: 0;
    display: flex;
    flex-direction: column; 
    row-gap: 16px;
    padding: 16px;
    background: var(--navbar-bg-color);
  }

  .title {
    font-size: 1rem;
    font-weight: 600;
  }
</style>