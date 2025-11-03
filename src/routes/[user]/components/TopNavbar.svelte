<script>
  import { openSettings, currentMode } from '$lib/store'
  import { createEventDispatcher } from 'svelte'
  import { jumpToToday } from '/src/routes/[user]/components/Calendar/autoScrolling.js'

  const dispatch = createEventDispatcher()

  function recalibrateToCalendar () {
    if ($currentMode === 'Week') {
      jumpToToday()
    }
    updateMode('Week')
  }

  function updateMode (newMode) {
    currentMode.set(newMode)
  }
</script>

<div class="top-navbar">
  <img on:click={openSettings}
    src="/logo-no-bg.png"
    style="width: 38px; height: 38px; margin-right: 6px; margin-left: -4px; cursor: pointer;"
    alt=""
  />

  <div class="day-week-toggle-segment">
    <button on:click={recalibrateToCalendar}
      class="ux-tab-item" 
      class:active-ux-tab={$currentMode === 'Week'}
    >
      <span class="material-symbols-outlined" style="font-size: 32px;">
        house
      </span>
    </button>

    <button on:click={() => updateMode('Templates')}
      class="ux-tab-item"
      class:active-ux-tab={$currentMode === 'Templates'}
    >
      <span class="material-symbols-outlined" style="font-size: 32px;">
        repeat
      </span>
    </button>

    <button on:click={() => updateMode('Archive')}
      class="ux-tab-item"
      class:active-ux-tab={$currentMode === 'Archive'}
    >
      <span class="material-symbols-outlined" style="font-size: 32px;">
        search_insights
      </span>
    </button>
  </div>

  {#if $currentMode === 'Archive'}
    <div style="display: flex; gap: 28px; align-items: center;">
      <button on:click={() => dispatch('robot-click')} class="material-symbols-outlined" style="font-size: 28px; cursor: pointer;">
        smart_toy
      </button>
    </div>
  {/if}
</div>

<style>
  .top-navbar {
    height: var(--height-navbar);
    display: flex; 
    width: 100%;
    align-items: center; 
    padding-left: 2vw; 
    padding-right: 2vw;
    border-bottom: 1px solid var(--faint-color);
    background-color: var(--navbar-bg-color);

    /* background holder has z-index 0 but somehow z-index 1 is not enough to cover it */
    z-index: 2;
    position: relative;
  }

  .day-week-toggle-segment {
    display: flex;
    margin-left: 64px;
    width: fit-content;
    justify-content: space-evenly;
    border-bottom: 0px solid rgb(200, 200, 200);
    margin: auto;
  }

  .ux-tab-item {
    box-sizing: border-box;
    height: var(--height-navbar);
    width: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 2px solid transparent;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    color: rgb(120, 120, 120);
    font-weight: 300;
  }

  .active-ux-tab {
    border-bottom: 1px solid var(--location-indicator-color);
    color: var(--location-indicator-color);
    font-weight: 500;
  }

  /* Transparent over-lay navbar that we might re-introduce later as a theme */
  .transparent-inactive-tab {
    color: black;
    font-weight: 400;
  }

  .container-for-float-cards {
    margin: auto;
    height: 70%;
    min-width: 800px;
    width: 70%;
    max-width: 1200px;
    z-index: 1;
    display: flex;
  }

  .transparent-glow-tab {
    color: white;
    font-weight: 500;
    border-bottom: 1px solid white;
  }

  .transparent-glow-navbar {
    background-color: rgba(150, 150, 150, 0.1);
    border-bottom: none;
  }
</style> 