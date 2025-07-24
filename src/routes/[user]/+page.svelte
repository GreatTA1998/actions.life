<script>
  import TopNavbar from './components/TopNavbar.svelte'
  import Archive from './components/Archive/index.svelte'
  import Templates from './components/Templates/Templates.svelte'
  import AI from './components/AI/AI.svelte'
  import TheSnackbar from './components/TheSnackbar.svelte'
  import NavbarContentLayout from '$lib/components/NavbarContentLayout.svelte'
  import SideBySideView from './components/SideBySideView/index.svelte'
  import TaskPopup from './components/TaskPopup/TaskPopup.svelte'
  import Settings from './components/Settings/index.svelte'
  import ExtendRoutines from './components/ExtendRoutines.svelte'

  import { onDestroy, onMount } from 'svelte'
  import { user, loadingTasks, currentMode, showSnackbar, isTaskPopupOpen, settingsOpen } from '$lib/store'

  let isShowingAI = true
  let unsub

  onMount(() => {
    loadingTasks.set(false)
  })

  onDestroy(() => {
    if (unsub) unsub()
  })
</script>

{#if $user.uid}
  <ExtendRoutines />

  {#if $showSnackbar}
    <TheSnackbar>Email copied to clipboard successfully.</TheSnackbar>
  {/if}

  <NavbarContentLayout>
    <div slot="navbar">
      <TopNavbar on:robot-click={() => isShowingAI = !isShowingAI} />
    </div>

    <div slot="content" class="relative z-0 flexbox" style="flex-grow: 1; height: 100%;">
      <div style="display: {$currentMode === 'Week' ? 'block' : 'none'}; width: 100%;">
        <SideBySideView />
      </div>

      <div style="display: {$currentMode === 'Templates' ? 'block' : 'none'}; width: 100%;">
        <Templates />
      </div>

      <div style="display: {$currentMode === 'Archive' ? 'flex' : 'none'}; flex-grow: 1; height: 100%;">
        <Archive />

        <div style="display: {isShowingAI ? 'block' : 'none'}; flex: 0 0 320px;">
          <AI />
        </div>
      </div>
    </div>
  </NavbarContentLayout>

  <!-- put popups last so they'll be on top of the stacking order and not get intercepted by dropzones' stopPropagation -->
  {#if $isTaskPopupOpen}
    <TaskPopup />
  {/if}

  {#if $settingsOpen}
    <Settings />
  {/if}
{/if}