{#if $user.uid}
  {#if $isTaskPopupOpen}
    <TaskPopup/>
  {/if}

  <div class="grid-container">
    <main class="content-area">
      {#if activeTabName === 'TODO_VIEW'}
        <div style="height: 100%; width: 100%; position: relative;">
          <TodoList style="background-color: transparent; padding-top: var(--main-content-top-margin);"
            willShowCheckbox={false}
            isLargeFont
            let:startTypingNewTask={startTypingNewTask}
          >
            <div on:click={startTypingNewTask} on:keydown class="fixed-round-button">
              <span id="startButton" class="material-symbols-outlined" style="font-size: 48px; font-weight: 600;">
                add
              </span>
            </div>
          </TodoList>
        </div>
      {:else if activeTabName === 'FUTURE_VIEW'}
        <ScheduleView on:task-duration-adjusted />
      {:else if activeTabName === 'CALENDAR_VIEW'}
        <Calendar />    
      {:else if activeTabName === 'AI_VIEW'}
        <AI />
      {/if}
    </main>

    <div class="bottom-navbar">
      <button on:click={() => activeTabName = 'TODO_VIEW'} class="bottom-nav-tab" class:active-nav-tab={activeTabName === 'TODO_VIEW'}>
        <div style="text-align: center;">
          <span class="material-symbols-outlined nav-tab-icon">
            summarize
          </span>
          <div class="nav-tab-desc">
            List
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
            Itinerary
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
  import Calendar from '../components/Calendar/Calendar.svelte'
  import TodoList from '../components/ListsArea/TodoList.svelte'
  import AI from '../components/AI/AI.svelte'
  import ScheduleView from './ScheduleView.svelte'
  import TaskPopup from '../components/TaskPopup/TaskPopup.svelte'

  import { user, hasInitialScrolled, isTaskPopupOpen } from '/src/lib/store'
  import { isCompact } from '../components/Calendar/store.js'
  import { onDestroy, onMount } from 'svelte'

  let activeTabName = 'CALENDAR_VIEW' // probably the new user default, butthen persists the user's preference e.g. I prefer the to-do
  let unsub

  onMount(async () => {
    isCompact.set(true)
  })

  onDestroy(() => {
    if (unsub) unsub()
  })
</script>

<svelte:head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
</svelte:head>

<style>
  :root {
    --bottom-navbar-height: 48px;
  }

  /* Prevent any scrolling on body */
  :global(body),
  :global(html) {
    overflow: hidden;
    height: 100%;
    width: 100%;
    position: fixed;
  }
  
  .grid-container {
    display: grid;
    grid-template-rows: minmax(0, 1fr) var(--bottom-navbar-height);
    height: 100vh;
    /* Support for iOS Safari */
    height: -webkit-fill-available;
    /* Support for modern browsers with dynamic viewport units */
    height: 100dvh;
    width: 100%;
    overflow: hidden;
  }
  
  .content-area {
    grid-row: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    /* Critical for grid scrolling - allows content to be smaller than container */
    min-height: 0;
    position: relative;
  }

  .bottom-navbar {
    grid-row: 2;
    z-index: 10;
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

  .fixed-round-button {
    position: fixed; 
    bottom: 60px; 
    right: 20px; 

    height: 72px;
    width: 72px;
    border-radius: 36px;  
    border: 4px solid black;

    display: flex;
    align-items: center;
    justify-content: center; 
    cursor: pointer;
  }
</style>
