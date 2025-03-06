<script>
  import ListArea from '$lib/ListArea.svelte'
  import TopNavbar from './TopNavbar.svelte'
  import TheFunctionalCalendar from '$lib/TheFunctionalCalendar/TheFunctionalCalendar.svelte'
  import HistoryArchive from '$lib/HistoryArchive/index.svelte'
  import Templates from '$lib/Templates/Templates.svelte'
  import AI from '../AI/AI.svelte'
  import TheSnackbar from '$lib/TheSnackbar.svelte'
  import NavbarAndContentWrapper from '$lib/NavbarAndContentWrapper.svelte'
  import DetailedCardPopup from '$lib/DetailedCardPopup/DetailedCardPopup.svelte'
  import { handleSW, handleNotificationPermission } from './handleNotifications.js'
  import { onDestroy, onMount } from 'svelte'
  import NewThisWeekTodo from '$lib/NewThisWeekTodo.svelte'

  import { user, showSnackbar } from '/src/store'
  import { createTaskNode, updateTaskNode, deleteTaskNode, deleteTaskAndChildren } from '/src/helpers/crud.js'
  import { dev } from '$app/environment'

  let currentMode = 'Week'
  let isShowingAI = false
  let clickedTask = {}
  let unsub

  onMount(async () => {
    if (!dev) {
      try {
        handleNotificationPermission($user)
        handleSW()
      } catch (error) {
        console.error('Error with notifications:', error)
      }
    }
  })

  onDestroy(() => {
    if (unsub) unsub()
  })
</script>

{#if clickedTask.id}
  <DetailedCardPopup
    taskObject={clickedTask}
    on:task-update={(e) => updateTaskNode(e.detail)}
    on:task-click={(e) => e => clickedTask = e.detail.task}
    on:card-close={() => (clickedTask = {})}
    on:task-delete={(e) => deleteTaskNode(e.detail)}
    on:task-delete-children={(e) => deleteTaskAndChildren(e.detail)}
    on:task-checkbox-change={(e) =>
      updateTaskNode({
        id: e.detail.id,
        keyValueChanges: { isDone: e.detail.isDone }
      })}
    on:photo-layout-change={(e) => updateTaskNode(e.detail)}
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
        <NewThisWeekTodo
          on:task-create={(e) => createTaskNode(e.detail)}
          on:task-click={e => clickedTask = e.detail.task}
          on:task-checkbox-change={(e) =>
            updateTaskNode({
              id: e.detail.id,
              keyValueChanges: { isDone: e.detail.isDone }
            })}
        />

        <TheFunctionalCalendar
          on:task-create={(e) => createTaskNode(e.detail)}
          on:task-click={e => clickedTask = e.detail.task}
          on:task-update={(e) =>
            updateTaskNode({
              id: e.detail.id,
              keyValueChanges: e.detail.keyValueChanges
            })
          }
        />

        <div style="display: {isShowingAI ? 'block' : 'none'}; flex: 0 0 320px;">
          <AI />
        </div>
      </div>

      <div style="width: 100%; background: hsl(98, 40%, 96%); display: {currentMode === 'Templates' ? 'block' : 'none'}">
        <Templates />
      </div>

      <div style="display: {currentMode === 'Archive' ? 'block' : 'none'}; width: 100%; height: 100%;">
        <HistoryArchive on:task-click={e => clickedTask = e.detail.task}/>
      </div>

      <div style="display: {currentMode === 'Lists' ? 'block' : 'none'}; width: 100%; height: 100%;">
        <ListArea on:task-click={e => clickedTask = e.detail.task}/>
      </div>
    </div>
  </NavbarAndContentWrapper>
{/if}
