<script>
  import TopNavbar from './components/TopNavbar.svelte'
  import Archive from './components/Archive/index.svelte'
  import Templates from './components/Templates/Templates.svelte'
  import AI from './components/AI/AI.svelte'
  import TheSnackbar from './components/TheSnackbar.svelte'
  import NavbarContentLayout from '$lib/components/NavbarContentLayout.svelte'
  import SideBySideView from './components/SideBySideView/index.svelte'
  import TaskPopup from './components/TaskPopup/TaskPopup.svelte'
  import Schedule from './mobile/Schedule.svelte'

  import { onDestroy, onMount } from 'svelte'
  import { user, loadingTasks, showSnackbar, isTaskPopupOpen } from '/src/lib/store'

  let currentMode = 'Week'
  let isShowingAI = false
  let unsub

  onMount(() => {
    loadingTasks.set(false)
  })

  onDestroy(() => {
    if (unsub) unsub()
  })
</script>

{#if $user.uid}
  {#if $showSnackbar}
    <TheSnackbar>Email copied to clipboard successfully.</TheSnackbar>
  {/if}

  <NavbarContentLayout>
    <div slot="navbar">
      <TopNavbar {currentMode} 
        on:tab-click={e => currentMode = e.detail}
        on:robot-click={() => isShowingAI = !isShowingAI}
      />
    </div>

    <div slot="content" style="display: flex; flex-grow: 1; height: 100%;">
      <div style="display: {currentMode === 'Week' ? 'flex' : 'none'}; width: 100%;">
        <SideBySideView />

        <div style="display: {isShowingAI ? 'block' : 'none'}; flex: 0 0 320px;">
          <AI />
        </div>
      </div>

      <div style="display: {currentMode === 'Templates' ? 'block' : 'none'}; width: 100%; background: hsl(98, 40%, 96%);">
        <Templates />
      </div>

      <div style="display: {currentMode === 'Archive' ? 'block' : 'none'}; width: 100%; height: 100%;">
        <Archive />
      </div>

      {#if currentMode === 'Schedule'}
        <div style="width: 100%; height: 100%;">
          <Schedule on:task-duration-adjusted />
        </div>
      {/if}
    </div>
  </NavbarContentLayout>

  <!-- put last so the click detection will be on top of the stacking order and not get intercepted by dropzones' stopPropagation -->
  {#if $isTaskPopupOpen}
    <TaskPopup />
  {/if}
{/if}