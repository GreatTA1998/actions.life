<script>
  import { activeView } from '$lib/store'
  import { jumpToToday } from '/src/routes/[user]/components/Calendar/autoScrolling.js'
  import MsHouseOutline from 'virtual:icons/material-symbols/house-outline'
  import MsPhotoCameraBackOutline from 'virtual:icons/material-symbols/photo-camera-back-outline'
  import MsRepeat from 'virtual:icons/material-symbols/repeat'
  import MsScheduleOutline from 'virtual:icons/material-symbols/schedule-outline'
   
  let { position = 'right' } = $props() // or 'bottom'

  let iconSize = $derived(`${position === 'bottom' ? 1.5 : 1.2}rem`)

  function onCalClick () {
    if ($activeView === 'CALENDAR') jumpToToday()
    else to('CALENDAR')
  }

  function to (view) {
    activeView.set(view)
  }
</script>

<div class="floating-navbar {position}">
  <button onclick={() => to('SETTINGS')} class="logo" class:active={$activeView === 'SETTINGS'}>
    <img src="/logo-no-bg.png" class="logo-img" />
  </button>

  <button onclick={onCalClick} class:active={$activeView === 'CALENDAR'}>
    <MsHouseOutline style="font-size: {iconSize}"/>
  </button>

  <button onclick={() => to('SCHEDULE')} class:active={$activeView === 'SCHEDULE'}>
    <MsScheduleOutline style="font-size: {iconSize}"/>
  </button>

  <button onclick={() => to('ROUTINES')} class:active={$activeView === 'ROUTINES'}>
    <MsRepeat style="font-size: {iconSize}"/>
  </button>

  <button onclick={() => to('PHOTOS')} class:active={$activeView === 'PHOTOS'}>
    <MsPhotoCameraBackOutline style="font-size: {iconSize}"/>
  </button>
</div>

<style>
  :root {
    --navbar-radius: 16px;
    --desktop-padding: 2px;
    --mobile-padding: 2px;
  }

  button {
    justify-content: center;
  }

  .floating-navbar {
    view-transition-name: floating-navbar;
    view-transition-class: static-ui;
    
    position: fixed;
    z-index: 2;
    display: flex;
    border-radius: var(--navbar-radius);
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  }

  .bottom {
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    padding: var(--desktop-padding);
    flex-direction: row;
    gap: 4px;
  }

  .right {
    top: 50%;
    right: 8px;
    transform: translateY(-50%);
    padding: var(--mobile-padding);
    flex-direction: column;
    gap: 4px;
  }

  .bottom {
    & button {
      border-radius: calc(var(--navbar-radius) - var(--desktop-padding));
      flex-direction: row;
      width: 40px;
      height: 40px;
      min-height: 40px;
      padding: 0 8px;
      gap: 0;
    }

    & .logo {
      padding: 0 8px;
    }
  }

  .right {
    & button {
      border-radius: calc(var(--navbar-radius) - var(--mobile-padding));
      flex-direction: column;
      width: 32px;
      min-height: 48px;
      gap: 2px;
    }
    
    & .logo {
      padding: 4px 0;
    }
  }

  .logo-img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  .active {
    font-weight: 600;
    background: rgba(180 180 180 / 0.2); /* 240, 0 --> 120 (too dark) --> 180 (decent) --> 210 (too faint) --> 195 (too faint) */
  }
</style>
