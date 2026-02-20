<script>
  import { user } from '$lib/store'
  import { getContext } from 'svelte'
  import { currentColorMode, setColorMode } from '$lib/store/themes'

  const { User } = getContext('app')
  
  let isSimple = $derived($user.simpleMode)
  const appearanceModes = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
  ]

  function setAppearanceMode (mode) {
    setColorMode(mode)
    User.update({ colorMode: mode })
  }
</script>

<div class="mode-settings">
  <div class="mode-row">
    <div class="mode-toggle">
      <button onclick={() => User.update({ simpleMode: true })} 
        class="mode-button"
        class:active={isSimple}
      >
        Simple
      </button>
      <button onclick={() => User.update({ simpleMode: false })} 
        class="mode-button"
        class:active={!isSimple}
      >
        Structured
      </button>
    </div>

    <p class="mode-description">
      {#if isSimple}
        Tasks move between lists and calendar
      {:else}
        Tasks persist on lists until archived
      {/if}
    </p>
  </div>

  <div class="mode-row">
    <div class="mode-toggle">
      {#each appearanceModes as mode}
        <button
          onclick={() => setAppearanceMode(mode.value)}
          class="mode-button"
          class:active={$currentColorMode === mode.value}
        >
          {mode.label}
        </button>
      {/each}
    </div>

    <p class="mode-description">
      Appearance
    </p>
  </div>
</div>

<style>
  .mode-settings {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .mode-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .mode-toggle {
    display: flex;
    background: var(--surface-2);
    border-radius: 6px;
    padding: 3px;
  }

  .mode-button {
    border-radius: 4px;
    padding: 4px 12px;
    font-weight: 500;
    color: var(--text-muted);
  }

  .mode-button.active {
    background: var(--surface-1);
    color: var(--text-primary);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .mode-description {
    font-size: 1rem;
    margin: 0;
    padding: 0 8px;
    color: var(--text-secondary);
  }
</style>
