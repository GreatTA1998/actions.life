<script>
  import { activeView } from '$lib/store'
  import { jumpToToday } from '/src/routes/[user]/components/Calendar/autoScrolling.js'

  let { position = 'right' } = $props() // 'right' | 'bottom'

  let isBottom = $derived(position === 'bottom')

  function onCalClick () {
    if ($activeView === 'CALENDAR') {
      jumpToToday()
    } else {
      changeTo('CALENDAR')
    }
  }

  function changeTo (view) {
    activeView.set(view)
  }
</script>

<div class="floating-navbar" 
  class:bot-nav={isBottom}
  class:right-nav={!isBottom}
>
  <button onclick={() => changeTo('SETTINGS')}
    class="my-btn logo-button" class:active={$activeView === 'SETTINGS'}
  >
    <img src="/logo-no-bg.png" alt="Logo" class="logo-img" />
  </button>

  <button onclick={onCalClick}
    class="my-btn" class:active={$activeView === 'CALENDAR'}
  >
    <span class="material-symbols-outlined nav-icon">
      house
    </span>
  </button>

  <button onclick={() => changeTo('DISCOVER')}
    class="my-btn" class:active={$activeView === 'DISCOVER'}
  >
    <span class="material-symbols-outlined nav-icon">
      manage_search
    </span>
  </button>
</div>

<style>
  :root {
    --navbar-radius: 16px;
    --desktop-padding: 2px;
    --mobile-padding: 2px;
  }

  .floating-navbar {
    position: fixed;
    z-index: 2;

    display: flex;
    border-radius: var(--navbar-radius);
    
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.4);
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  }

  .bot-nav {
    bottom: max(16px, env(safe-area-inset-bottom, 16px));
    left: 50%;
    transform: translateX(-50%);
    padding: var(--desktop-padding);
    flex-direction: row;
    gap: 4px;
  }

  .right-nav {
    top: 50%;
    right: max(16px, env(safe-area-inset-right, 16px));
    transform: translateY(-50%);
    padding: var(--mobile-padding);
    flex-direction: column;
    gap: 4px;
  }

  .logo-img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  .my-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .active {
    font-weight: 600;
    background: rgba(180 180 180 / 0.2); /* 240, 0 --> 120 (too dark) --> 180 (decent) --> 210 (too faint) --> 195 (too faint) */
  }

  .bot-nav {
    & .my-btn {
      border-radius: calc(var(--navbar-radius) - var(--desktop-padding));
      flex-direction: row;
      width: 40px;
      height: 40px;
      min-height: 40px;
      padding: 0 8px;
      gap: 0;
    }

    & .logo-button {
      padding: 0 8px;
    }

    & .nav-icon {
      font-size: 1.5rem;
    }
  }

  .right-nav {
    & .my-btn {
      border-radius: calc(var(--navbar-radius) - var(--mobile-padding));
      flex-direction: column;
      width: 32px;
      min-height: 48px;
      gap: 2px;
    }
    
    & .logo-button {
      padding: 4px 0;
    }

    & .nav-icon {
      font-size: 1.2rem;
    }
  }
</style>
