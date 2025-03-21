<script>
  import TopNavbar from './components/TopNavbar.svelte'
  import Archive from './components/Archive/index.svelte'
  import Templates from './components/Templates/Templates.svelte'
  import AI from './components/AI/AI.svelte'
  import TheSnackbar from './components/TheSnackbar.svelte'
  import NavbarContentLayout from '$lib/Reusable/NavbarContentLayout.svelte'
  import SideBySideView from './components/SideBySideView.svelte'
  import TaskPopup from './components/TaskPopup/TaskPopup.svelte'

  import { onDestroy, onMount } from 'svelte'
  import { page } from '$app/stores'
  import { user, loadingTasks, showSnackbar, isTaskPopupOpen } from '/src/store'
  import TodoService from './components/ListsArea/todoService.js'

  let currentMode = 'Week'
  let isShowingAI = false
  let unsub
  let showLegacyTodoInWeekMode

  onMount(() => {
    const uid = $page.params.user
    TodoService.setupTodoListener(uid)
    loadingTasks.set(false)
    // migrateToTreeISOs('yGVJSutBrnS1156uopQQOBuwpMl2', false)
  })

  onDestroy(() => {
    if (unsub) unsub()
  })

  function handleViewToggle(event, mode) {
    if (mode === 'Week') {
      showLegacyTodoInWeekMode = event.detail.showLegacyTodo;
    }
  }
</script>

{#if $user.uid}
  {#if $isTaskPopupOpen}
    <TaskPopup />
  {/if}

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
        <SideBySideView 
          showLegacyTodo={showLegacyTodoInWeekMode}
          on:viewToggle={e => handleViewToggle(e, 'Week')}
        />

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
    </div>
  </NavbarContentLayout>
{/if}