<script>
  import { activeView, user } from '$lib/store'
  import { jumpToToday } from '/src/routes/[user]/components/Calendar/autoScrolling.js'
  import MsSettingsOutline from 'virtual:icons/material-symbols/settings-outline'
  import MsTune from 'virtual:icons/material-symbols/tune'
  import MsDisplaySettingsOutline from 'virtual:icons/material-symbols/display-settings-outline'
  import MsPhotoCameraBackOutline from 'virtual:icons/material-symbols/photo-camera-back-outline'
  import MsRepeat from 'virtual:icons/material-symbols/repeat'
  import MsScheduleOutline from 'virtual:icons/material-symbols/schedule-outline'
   
  let { position = 'right' } = $props() // or 'bottom'

  let iconSize = $derived(`${position === 'bottom' ? 24 : 20}px`)

  function onCalClick () {
    if ($activeView === 'CALENDAR') jumpToToday()
    else to('CALENDAR')
  }

  function to (view) {
    activeView.set(view)
  }
</script>

<div class="floating-navbar {position}">
  <button onclick={() => to('SETTINGS')} class={['choice', { active: $activeView === 'SETTINGS' }]}>
    <MsSettingsOutline style="font-size: {iconSize}"/>
    <span>Gear</span>
  </button>

  <button onclick={() => to('SETTINGS')} class={['choice', { active: $activeView === 'SETTINGS' }]}>
    <MsTune style="font-size: {iconSize}"/>
    <span>Tune</span>
  </button>

  <button onclick={() => to('SETTINGS')} class={['choice', { active: $activeView === 'SETTINGS' }]}>
    <MsDisplaySettingsOutline style="font-size: {iconSize}"/>
    <span>Screen</span>
  </button>

  <button onclick={onCalClick} class={['logo', { active: $activeView === 'CALENDAR' }]}>
    {#if $user.unread || true}
      <img src="/leaf-2-no-bg.avif" class="size-[40px]" alt="" />
    {:else}
      <img src="/logo-no-bg.png" class="size-[28px]" alt="" />
    {/if}
  </button>

  {#if $user.scheduleEnabled !== false}
    <button onclick={() => to('SCHEDULE')} class={{ active: $activeView === 'SCHEDULE' }}>
      <MsScheduleOutline style="font-size: {iconSize}"/>
    </button>
  {/if}

  {#if $user.repeatEnabled !== false}
    <button onclick={() => to('ROUTINES')} class={{ active: $activeView === 'ROUTINES' }}>
      <MsRepeat style="font-size: {iconSize}"/>
    </button>
  {/if}

  {#if $user.photoEnabled !== false}
    <button onclick={() => to('PHOTOS')} class={{ active: $activeView === 'PHOTOS' }}>
      <MsPhotoCameraBackOutline style="font-size: {iconSize}"/>
    </button>
  {/if}
</div>

<style>
  :root {
    --navbar-radius: 16px;
    --desktop-padding: 2px;
    --mobile-padding: 2px;
  }

  .floating-navbar {
    view-transition-name: floating-navbar;
    view-transition-class: static-ui;
    
    position: absolute;
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

  .choice {
    font-size: 10px;
    line-height: 1;
    color: #5c5c5c;
    white-space: nowrap;
  }

  .bottom button.choice {
    width: auto;
    min-width: 44px;
    height: auto;
    min-height: 48px;
    flex-direction: column;
    padding: 4px 6px 3px;
    gap: 2px;
  }

  .right button.choice {
    width: auto;
    min-width: 40px;
    padding: 4px 4px 3px;
  }
</style>
