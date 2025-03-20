{#if $user.uid}
  {#if $isTaskPopupOpen}
    <TaskPopup/>
  {/if}

  <!-- Reason for 100dvh: https://stackoverflow.com/a/75648985/7812829 -->
  <!-- style="padding: 6px; background-color: white; display: flex; align-items: center; justify-content: center;" -->
  <div class:iphone-se-size={isTesting} 
      class:general-mobile-size={!isTesting}
      class:voice-active-highlight={isUsingVoice}
      style="height: 100dvh; position: relative; display: flex; flex-direction: column;"
  >
    <div style="overflow-y: auto;">
      {#if activeTabName === 'TODO_VIEW'}
        <ListView
          let:startTypingNewTask={startTypingNewTask}
        >
          <FloatingButtonWrapper on:click={startTypingNewTask} distanceFromBottom={100}>
            <span id="startButton" class="material-symbols-outlined" style="font-size: 48px; font-weight: 600;">
              add
            </span>
          </FloatingButtonWrapper>

          <FloatingButtonWrapper let:setBackgroundColor={setBackgroundColor}>
            <VoiceKeywordDetect
              on:voice-start={() => {
                isUsingVoice = true; 
                setBackgroundColor('orange');
              }}
              on:voice-end={() => isUsingVoice = false}
              on:new-mic-result={(e) => speechResult = e.detail}
              on:new-event-today={(e) => createNewEvent(e.detail)}
              on:new-todo={(e) => createNewTodo(e.detail)}
            />
          </FloatingButtonWrapper>
        </ListView>
      {:else if activeTabName === 'FUTURE_VIEW'}
        <ScheduleView on:task-duration-adjusted />
      {:else if activeTabName === 'CALENDAR_VIEW'}
        <Calendar />    
      {:else if activeTabName === 'AI_VIEW'}
        <AI />
      {/if}
    </div>

    <div class="bottom-navbar">
      <button on:click={() => activeTabName = 'TODO_VIEW'} class="bottom-nav-tab" class:active-nav-tab={activeTabName === 'TODO_VIEW'}>
        <div style="text-align: center;">
          <span class="material-symbols-outlined nav-tab-icon">
            summarize
          </span>
          <div class="nav-tab-desc">
            To-do
          </div>
        </div>
      </button>

      <button class="bottom-nav-tab" 
        on:click={() => {
          hasInitialScrolled.set(false)
          activeTabName = 'CALENDAR_VIEW'
        }}
        class:active-nav-tab={activeTabName === 'CALENDAR_VIEW'}
      >
        <div style="text-align: center;">
          <span class="material-symbols-outlined nav-tab-icon">
            house
          </span>
          <div class="nav-tab-desc">
            Calendar
          </div>
        </div>
      </button>

      <button class="bottom-nav-tab" on:click={() => activeTabName = 'FUTURE_VIEW'} class:active-nav-tab={activeTabName === 'FUTURE_VIEW'}>
        <div style="text-align: center;">
          <span class=" material-icons nav-tab-icon">
            upcoming
          </span>
          <div class="nav-tab-desc">
            Events
          </div>
        </div>
      </button>

      <button class="bottom-nav-tab" on:click={() => activeTabName = 'AI_VIEW'} class:active-nav-tab={activeTabName === 'AI_VIEW'}>
        <div style="text-align: center;">
          <span class=" material-symbols-outlined nav-tab-icon">
            smart_toy
          </span>
          <div class="nav-tab-desc">
            Robot
          </div>
        </div>
      </button>
    </div>
  </div>
{/if}

<script>
  import Calendar from '$lib/Calendar/Calendar.svelte'
  import AI from '$lib/AI/AI.svelte'
  import ScheduleView from '$lib/Mobile/ScheduleView.svelte'
  import ListView from '$lib/Mobile/ListView.svelte'
  import VoiceKeywordDetect from './VoiceKeywordDetect.svelte'
  import TaskPopup from '$lib/TaskPopup/TaskPopup.svelte'
  import FloatingButtonWrapper from './FloatingButtonWrapper.svelte'

  import { setupTodoListener } from '/src/store/services/TodoService.js'
  import { createTaskNode } from '/src/db/crud.js'
  import { getRandomID, getDateInMMDD } from '/src/utils/core.js'
  import { user, todoMemoryTree, hasInitialScrolled, isTaskPopupOpen } from '/src/store'
  import { isCompact } from '/src/lib/Calendar/store.js'
  import { page } from '$app/stores'
  import { onDestroy, onMount } from 'svelte'

  let isTesting = false
  let activeTabName = 'CALENDAR_VIEW' // probably the new user default, butthen persists the user's preference e.g. I prefer the to-do
  let unsub
  
  let isUsingVoice = false
  let speechResult = ''

  $: userID = $page.params.user

  onMount(async () => {
    setupTodoListener(userID)
    // note, we fetch future events inside that component as a quickfix, so
    // it'll react to changes in calendar and todo

    isCompact.set(true)
  })

  onDestroy(() => {
    if (unsub) unsub()
  })

  function createNewEvent ({ name, startTime }) {
    const newTaskObj = {
      name,
      parentID: '',
      startTime,
      startDate: getDateInMMDD(new Date())
    }
    createTaskNode({ id: getRandomID(), newTaskObj })
  }

  // should be a function exposed by the `TodoList` component
  function createNewTodo ({ name }) {
    const dueInHowManyDays = 7
    const d = new Date()
    d.setDate(d.getDate() + dueInHowManyDays - 1)

    const newTaskObj = {
      name,
      parentID: ''
    }

    if ($todoMemoryTree.length > 0) {
      newTaskObj.orderValue = (0 + $todoMemoryTree[0].orderValue) / 1.1
    } 
    // if it's the first task, the orderValue is initialized to `maxOrder`

    createTaskNode({ id: getRandomID(), newTaskObj })
  }
</script>

<style>
  :root {
    --bottom-navbar-height: 48px;
  }

  .voice-active-highlight {
    background-color: rgb(180, 238, 221);
  }

  .iphone-se-size {
    width: 375px; 
    height: 667px;
    border: 2px solid black;
  }

  .general-mobile-size {
    height: 100vh; 
  }

  .bottom-navbar {
    margin-top: auto;
    width: 100%; 
    height: var(--bottom-navbar-height); 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    background-color: white;
    border-top: 1px solid lightgrey;
  }

  .bottom-nav-tab {
    display: flex; 
    align-items: center;
    justify-content: center;

    height: 100%;
    flex-basis: 0;
    flex-grow: 1;
    flex-shrink: 1;

    color: rgb(110, 110, 110);

    padding-top: 4px;
    padding-bottom: 4px;
  }

  .active-nav-tab {
    color: rgb(0, 0, 0);
    font-weight: 500;
    border-top: 0px solid rgb(0, 0, 0);
  }

  .nav-tab-desc {
    font-size: 12px;
    margin-top: -4px;
  }

  .nav-tab-icon {
    font-size: 24px;
  }
</style>