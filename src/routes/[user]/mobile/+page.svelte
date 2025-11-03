{#if $user.uid}
  {#if $isTaskPopupOpen}
    <TaskPopup/>
  {/if}

  {#if $settingsOpen}
    <Settings />
  {/if}

  <div class="grid-container">
    <main class="content-area">
      {#if activeTabName === 'CALENDAR_VIEW'}
        <TopBelowView />
      {:else if activeTabName === 'DISCOVER_VIEW'}
        <Discover />
      {:else if activeTabName === 'FUTURE_VIEW'}
        <Schedule on:task-duration-adjusted />
      {:else if activeTabName === 'PHOTO_ARCHIVE'}
        <PhotoGrid />
      {:else if activeTabName === 'AI_VIEW'}
        <AI />
      {/if}
    </main>

    <div class="floating-navbar">
      <button class="nav-icon-button logo-button" 
        on:click={toggleSettings}
        aria-label="Settings"
        title="Settings"
      >
        <img src="/logo-no-bg.png" alt="Logo" class="logo-img" />
      </button>

      <button class="nav-icon-button" 
        on:click={() => {
          if (activeTabName === 'CALENDAR_VIEW') jumpToToday()
          else {
            activeTabName = 'CALENDAR_VIEW'
          }
        }}
        class:active-nav-tab={activeTabName === 'CALENDAR_VIEW'}
        aria-label="Calendar"
      >
        <span class="material-symbols-outlined nav-icon">
          house
        </span>
      </button>

      <button class="nav-icon-button" 
        on:click={() => activeTabName = 'DISCOVER_VIEW'} 
        class:active-nav-tab={activeTabName === 'DISCOVER_VIEW'} 
        aria-label="Discover"
      >
        <span class="material-symbols-outlined nav-icon">
          manage_search
        </span>
      </button>
    </div>
  </div>
{/if}

<script>
  import TopBelowView from '../components/TopBelowView/index.svelte'
  import AI from '../components/AI/AI.svelte'
  import Schedule from './Schedule.svelte'
  import TaskPopup from '../components/TaskPopup/TaskPopup.svelte'
  import PhotoGrid from '../components/Archive/PhotoGrid.svelte'
  import Discover from './Discover.svelte'
  import Settings from '../components/Settings/index.svelte'

  import { jumpToToday } from '/src/routes/[user]/components/Calendar/autoScrolling.js'
  import { user, isTaskPopupOpen, openSettings, settingsOpen, toggleSettings } from '/src/lib/store'
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
  /* Prevent any scrolling on body */
  :global(body),
  :global(html) {
    overflow: hidden;
    height: 100%;
    width: 100%;
    position: fixed;
    overscroll-behavior: none;
  }

  :global(body) {
    background: rgb(245, 245, 245); /* 240 > optimal > 220, previously #f1f3f4; */
  }
  
  .grid-container {
    display: grid;
    grid-template-rows: 1fr;
    height: 100vh;
    /* Support for iOS Safari */
    height: -webkit-fill-available;
    /* Support for modern browsers with dynamic viewport units */
    height: 100dvh;
    width: 100%;
    overflow: hidden;
    position: relative;
  }
  
  .content-area {
    grid-row: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    /* Critical for grid scrolling - allows content to be smaller than container */
    min-height: 0;
    position: relative;
  }

  .floating-navbar {
    position: fixed;
    top: 50%;
    right: max(16px, env(safe-area-inset-right, 16px));
    transform: translateY(-50%);
    z-index: 100;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px 4px;
    border-radius: 16px;
    
    /* Simple translucent background */
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  }

  .nav-icon-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 36px;
    min-height: 56px;
    border: none;
    background: transparent;
    border-radius: 10px;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.7);
    padding: 4px 0;
    gap: 2px;
  }

  .active-nav-tab {
    color: var(--location-indicator-color);
    color: black;
    font-weight: 500;
    background-color: rgba(0, 0, 0, 0.05);
  }

  .nav-icon {
    font-size: 22px;
  }

  .logo-button {
    padding: 4px 0;
  }

  .logo-img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
</style>
