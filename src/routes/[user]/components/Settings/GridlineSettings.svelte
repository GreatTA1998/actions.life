<script>
  import { updateFirestoreDoc } from '$lib/db/helpers.js'
  import { user, calSnapInterval } from '$lib/store'

  const snapIntervals = [1, 5, 10, 15, 30, 60]

  function updateSettings (interval) {
    updateFirestoreDoc(`users/${$user.uid}`, { calSnapInterval: interval })
  }
</script>

<div class="gridlines-container">
  <div class="snap-settings">
    <div class="snap-label">Snap to nearest</div>
    <div class="interval-selector">
      <div class="interval-buttons">
        {#each snapIntervals as interval}
          <button 
            on:click={() => updateSettings(interval)} 
            class="interval-button justify-center"
            class:active={$calSnapInterval === interval}
          >
            {interval}
          </button>
        {/each}
      </div>
      <span class="unit-label">min</span>
    </div>
  </div>
</div>

<style>
  .gridlines-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .snap-settings {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .snap-label {
    font-size: 0.875rem;
    font-weight: 400;
  }

  .interval-selector {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .interval-buttons {
    display: flex;
    background: var(--surface-2);
    border-radius: 6px;
    padding: 3px;
  }

  .interval-button {
    background: transparent;
    border: none;
    border-radius: 4px;
    padding: 5px 0;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-secondary);
    min-width: 36px;
    cursor: pointer;
  }

  .interval-button.active {
    background: var(--surface-1);
    color: var(--text-primary);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .unit-label {
    font-size: 13px;
    color: var(--text-muted);
  }
</style>
