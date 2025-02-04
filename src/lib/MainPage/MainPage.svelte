<script>
  import TheFunctionalCalendar from '$lib/TheFunctionalCalendar/TheFunctionalCalendar.svelte'
  import {
    mostRecentlyCompletedTaskID,
    user,
    showSnackbar,
    hasInitialScrolled
  } from '/src/store'
  import Templates from '$lib/Templates/Templates.svelte'
  import AI from '../AI/AI.svelte'
  import TheSnackbar from '$lib/TheSnackbar.svelte'
  import PopupCustomerSupport from '$lib/PopupCustomerSupport.svelte'
  import NavbarAndContentWrapper from '$lib/NavbarAndContentWrapper.svelte'
  import DetailedCardPopup from '$lib/DetailedCardPopup/DetailedCardPopup.svelte'
  import MultiPhotoUploader from '$lib/MultiPhotoUploader.svelte'
  import {
    handleSW,
    handleNotificationPermission
  } from './handleNotifications.js'
  import { onDestroy, onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { getAuth, signOut } from 'firebase/auth'
  import { arrayUnion } from 'firebase/firestore'
  import NewThisWeekTodo from '$lib/NewThisWeekTodo.svelte'
  import { handleInitialTasks } from './handleTasks.js'
  import {
    createTaskNode,
    updateTaskNode,
    deleteTaskNode,
    deleteTaskAndChildren
  } from '/src/helpers/crud.js'
  import { findTaskByID } from '/src/helpers/utils.js'
  import { dev } from '$app/environment'

  let currentMode = 'Week'
  let isShowingAI = false

  let clickedTaskID = ''
  let clickedTask = {}

  let unsub

  $: if (clickedTaskID) {
    if (clickedTaskID) clickedTask = findTaskByID(clickedTaskID)
    else clickedTask = {}
  }

  onMount(async () => {
    if (!dev) {
      try {
        handleNotificationPermission($user)
        handleSW()
      } catch (error) {
        console.error('Error with notifications:', error)
      }
    }
    handleInitialTasks($user.uid)
  })

  function openDetailedCard({ task }) {
    clickedTaskID = task.id
  }

  function handleLogoClick() {
    if (confirm('Log out and return to home page tutorials?')) {
      const auth = getAuth()
      signOut(auth).catch(console.error)
      goto('/')
    }
  }

  // TO-DO: should probably deprecate
  function createSubtask({ id, parentID, newTaskObj }) {
    // the parent needs to update its pointers
    updateTaskNode({
      id: parentID,
      keyValueChanges: { children: arrayUnion(id) }
    })
    createTaskNode({ id, newTaskObj })
  }

  onDestroy(() => {
    if (unsub) unsub()
  })
</script>

{#if clickedTaskID}
  <DetailedCardPopup
    taskObject={clickedTask}
    on:task-update={(e) => updateTaskNode(e.detail)}
    on:task-click={(e) => openDetailedCard(e.detail)}
    on:card-close={() => (clickedTaskID = '')}
    on:task-delete={(e) => deleteTaskNode(e.detail)}
    on:task-delete-children={(e) => deleteTaskAndChildren(e.detail)}
    on:task-checkbox-change={(e) =>
      updateTaskNode({
        id: e.detail.id,
        keyValueChanges: { isDone: e.detail.isDone }
      })}
  />
{/if}

<!-- UNDO COMPLETED SNACKBAR -->
{#if $mostRecentlyCompletedTaskID}
  <TheSnackbar
    on:undo-task-completion={() => {
      updateTaskNode({
        id: $mostRecentlyCompletedTaskID,
        keyValueChanges: {
          isDone: false
        }
      })
      mostRecentlyCompletedTaskID.set('')
    }}
  ></TheSnackbar>
{/if}

{#if $showSnackbar}
  <TheSnackbar>Email copied to clipboard successfully.</TheSnackbar>
{/if}

<NavbarAndContentWrapper>
  <div slot="navbar"
    class="top-navbar"
    class:transparent-glow-navbar={currentMode === 'Day'}
  >
    <img on:click={() => handleLogoClick()} on:keydown
      src="/trueoutput-square-nobg.png"
      style="width: 38px; height: 38px; margin-right: 6px; margin-left: -4px; cursor: pointer;"
      alt=""
    />

    <div class="day-week-toggle-segment">

      <!-- pressing home recalibrates you to today's region -->
      <div 
        on:click={async () => {
          if (currentMode === 'Week') {
            hasInitialScrolled.set(false)
          }
          currentMode = 'Week'
        }} on:keydown
        class="ux-tab-item"
        class:active-ux-tab={currentMode === 'Week'}
        class:transparent-inactive-tab={currentMode === 'Day'}
      >
        <span class="material-symbols-outlined" style="font-size: 32px;">
          house
        </span>
      </div>

      <div on:click={() => (currentMode = 'Templates')} on:keydown
        class="ux-tab-item"
        class:active-ux-tab={currentMode === 'Templates'}
        class:transparent-inactive-tab={currentMode === 'Day'}
      >
        <span class:blue-icon={currentMode === 'Dashboard'}
          class="material-symbols-outlined"
          style="font-size: 32px;"
        >
          autorenew
        </span>
      </div>
    </div>

    <div style="display: flex; gap: 28px; align-items: center;">
      <span on:click={() => isShowingAI = !isShowingAI} on:keydown class="material-symbols-outlined" style="font-size: 28px; cursor: pointer;">
        smart_toy
      </span>
      <!-- <PopupCustomerSupport let:setIsPopupOpen>
        <span on:click={() => setIsPopupOpen({ newVal: true })} on:keydown
          class="material-symbols-outlined mika-hover responsive-icon-size"
        >
          contact_support
        </span>
      </PopupCustomerSupport> -->
    </div>
  </div>

  <div slot="content" style="display: flex; flex-grow: 1; height: 100%;">
    <div style="display: {currentMode === 'Week' ? 'flex' : 'none'}; width: 100%;">
      <NewThisWeekTodo
        on:new-root-task={(e) => createTaskNode(e.detail)}
        on:task-click={(e) => openDetailedCard(e.detail)}
        on:subtask-create={(e) => createSubtask(e.detail)}
        on:task-checkbox-change={(e) =>
          updateTaskNode({
            id: e.detail.id,
            keyValueChanges: { isDone: e.detail.isDone }
          })}
      />

      <TheFunctionalCalendar
        on:new-root-task={(e) => createTaskNode(e.detail)}
        on:task-click={(e) => openDetailedCard(e.detail)}
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
  </div>
</NavbarAndContentWrapper>

<style src="./MainPage.css"></style>
