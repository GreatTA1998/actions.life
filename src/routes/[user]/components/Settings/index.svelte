<script>
  import CommunityChat from '$lib/components/CommunityChat/index.svelte'
  import ModeSettings from './ModeSettings.svelte'
  import ColorSettings from './ColorSettings.svelte'
  import PhotoSettings from './PhotoSettings.svelte'
  import IconBrowser from '../Templates/components/IconsDisplay/IconBrowser.svelte'
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

  const settingsGroup = 'shrink-0 flex flex-col gap-y-4 p-4 bg-[var(--navbar-bg-color)]'
</script>

<div class="flex flex-col h-full overflow-y-auto bg-[rgb(235,235,235)]"> 
  <div class="flex flex-col gap-3">
    <div class={settingsGroup}>
      <div class="flex gap-x-3 items-center">
        <h2>App</h2>
        
        <ColorSettings />
      </div>
      <ModeSettings />
    </div>
  
    <div class={settingsGroup}>
      <div class="flex flex-col gap-y-6">

        <div class="flex gap-x-3 items-center">
          <h2>Calendar</h2>
          <AddAccount />
        </div>

        <GridlineSettings />
        
        <GCalDashboard />
      </div>
    </div>

    <div class={settingsGroup}>
      <div class="flex items-center gap-x-3">
        <h2>Data</h2>
        <span class="text-sm text-[var(--success-color)]">
          {statusMessage}
        </span>
      </div>

      <DataExport onFinish={message => statusMessage = message}/>
    </div>

    <div class={settingsGroup}>
      <h2>Photo</h2>
      <PhotoSettings />
    </div>

    <div class={settingsGroup}>
      <h2>Icons</h2>
      <IconBrowser gridClass="gap-1 mb-3" />
    </div>

    <div class={settingsGroup}>
      <h2>Community Chat</h2>
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
  h2 {
    font-size: 1rem;
    font-weight: 600;
  }
</style>