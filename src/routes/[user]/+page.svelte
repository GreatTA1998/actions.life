<script>
  import ListsArea from '$lib/ListsArea/ListsArea.svelte'
  import TopNavbar from '$lib/MainPage/TopNavbar.svelte'
  import Calendar from '$lib/Calendar/Calendar.svelte'
  import HistoryArchive from '$lib/HistoryArchive/index.svelte'
  import Templates from '$lib/Templates/Templates.svelte'
  import AI from '$lib/AI/AI.svelte'
  import TheSnackbar from '$lib/MainPage/TheSnackbar.svelte'
  import NavbarAndContentWrapper from '$lib/NavbarAndContentWrapper.svelte'
  import DetailedCardPopup from '$lib/DetailedCardPopup/DetailedCardPopup.svelte'
  import WeeklyTodo from '$lib/ListsArea/WeeklyTodo.svelte'

  import { onDestroy, onMount } from 'svelte'
  import { page } from '$app/stores'
  import { user, showSnackbar, clickedTask, isDetailedCardOpen } from '/src/store'
  import { createTaskNode, updateTaskNode, deleteTaskNode, deleteTaskAndChildren } from '/src/helpers/crud.js'
  import { handleInitialTasks } from '$lib/MainPage/handleTasks'

  let currentMode = 'Week'
  let isShowingAI = false
  let unsub

  onMount(() => {
    handleInitialTasks($page.params.user)
  })

  onDestroy(() => {
    if (unsub) unsub()
  })
</script>

{#if $isDetailedCardOpen}
  <DetailedCardPopup taskObject={$clickedTask}
    on:task-update={e => updateTaskNode(e.detail)}
    on:task-delete={e => deleteTaskNode(e.detail)}
    on:task-delete-children={e => deleteTaskAndChildren(e.detail)}
  />
{/if}

{#if $user.uid}
  {#if $showSnackbar}
    <TheSnackbar>Email copied to clipboard successfully.</TheSnackbar>
  {/if}

  <NavbarAndContentWrapper>
    <div slot="navbar">
      <TopNavbar {currentMode} 
        on:tab-click={e => currentMode = e.detail}
        on:robot-click={() => isShowingAI = !isShowingAI}
      />
    </div>

    <div slot="content" style="display: flex; flex-grow: 1; height: 100%;">
      <div style="display: {currentMode === 'Week' ? 'flex' : 'none'}; width: 100%;">
        <WeeklyTodo
          on:task-create={e => createTaskNode(e.detail)}
          on:task-update={e => updateTaskNode(e.detail)}
        />

        <Calendar
          on:task-create={e => createTaskNode(e.detail)}
          on:task-update={e => updateTaskNode(e.detail)}
        />

        <div style="display: {isShowingAI ? 'block' : 'none'}; flex: 0 0 320px;">
          <AI />
        </div>
      </div>

      <div style="display: {currentMode === 'Templates' ? 'block' : 'none'}; width: 100%; background: hsl(98, 40%, 96%);">
        <Templates />
      </div>

      <div style="display: {currentMode === 'Archive' ? 'block' : 'none'}; width: 100%; height: 100%;">
        <HistoryArchive />
      </div>

      <div style="display: {currentMode === 'Lists' ? 'block' : 'none'}; width: 100%; height: 100%;">
        <ListsArea />
      </div>
    </div>
  </NavbarAndContentWrapper>
{/if}