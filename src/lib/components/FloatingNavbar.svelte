<script>
  import { activeView } from '$lib/store'
  import { jumpToToday } from '/src/routes/[user]/components/Calendar/autoScrolling.js'

  let { position = 'right' } = $props() // 'right' | 'bottom'

  let isBottom = $derived(position === 'bottom')

  function onCalClick () {
    if ($activeView === 'CALENDAR') {
      jumpToToday()
    } else {
      activeView.set('CALENDAR')
    }
  }
</script>

<div 
  class="floating-navbar"
  class:bottom-position={isBottom}
  class:right-position={!isBottom}
>
  <button 
    class="nav-icon-button logo-button" 
    class:active-nav-tab={$activeView === 'SETTINGS'}
    onclick={() => activeView.set('SETTINGS')}
    aria-label="Settings"
    title="Settings"
  >
    <img src="/logo-no-bg.png" alt="Logo" class="logo-img" />
  </button>

  <button onclick={onCalClick}
    class="nav-icon-button" 
    class:active-nav-tab={$activeView === 'CALENDAR'}
    aria-label="Calendar"
  >
    <span class="material-symbols-outlined nav-icon">
      house
    </span>
  </button>

  <button onclick={() => activeView.set('DISCOVER')}
    class="nav-icon-button" 
    class:active-nav-tab={$activeView === 'DISCOVER'}
    aria-label="Discover"
  >
    <span class="material-symbols-outlined nav-icon">
      manage_search
    </span>
  </button>
</div>

<style>
  .floating-navbar {
    position: fixed;
    z-index: 2;

    display: flex;
    gap: 4px;
    border-radius: 16px;
    
    /* Simple translucent background */
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  }

  .bottom-position {
    bottom: max(16px, env(safe-area-inset-bottom, 16px));
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 8px;
    flex-direction: row;
  }

  .right-position {
    top: 50%;
    right: max(16px, env(safe-area-inset-right, 16px));
    transform: translateY(-50%);
    padding: 6px 4px;
    flex-direction: column;
  }

  .nav-icon-button {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    border-radius: 10px;
    cursor: pointer;
    color: rgba(0, 0, 0, 0.7);
  }

  .right-position .nav-icon-button {
    flex-direction: column;
    width: 36px;
    min-height: 56px;
    padding: 4px 0;
    gap: 2px;
  }

  .bottom-position .nav-icon-button {
    flex-direction: row;
    width: 40px;
    height: 40px;
    min-height: 40px;
    padding: 0 8px;
    gap: 0;
  }


  .right-position .logo-button {
    padding: 4px 0;
  }

  .bottom-position .logo-button {
    padding: 0 8px;
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

  .logo-img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
</style>
