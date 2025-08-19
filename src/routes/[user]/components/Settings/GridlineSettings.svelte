<script>
  import { updateFirestoreDoc } from '$lib/db/helpers.js'
  import { user, calSnapInterval } from '$lib/store'
  import CheckboxSquare from '$lib/components/CheckboxSquare.svelte'

  const snapIntervals = [1, 5, 10, 15, 30]

  function updateSettings (interval) {
    updateFirestoreDoc(`users/${$user.uid}`, { calSnapInterval: interval })
  }

  function toggleGridlines () {
    updateFirestoreDoc(`/users/${$user.uid}`, { 
      hasGridlines: !$user.hasGridlines 
    })
  }
</script>

<div class="gridlines-container">
  <CheckboxSquare 
    value={$user.hasGridlines}
    onClick={toggleGridlines}
    label="Show gridlines on calendar"
  />

  <div class="snap-settings">
    <div class="snap-label">Snap to interval</div>
    <div class="interval-selector">
      <div class="interval-buttons">
        {#each snapIntervals as interval}
          <button 
            on:click={() => updateSettings(interval)} 
            class="interval-button"
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
    font-size: 13px;
    font-weight: 500;
    color: #555;
  }

  .interval-selector {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .interval-buttons {
    display: flex;
    background: #f5f5f5;
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
    color: #555;
    min-width: 36px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .interval-button:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .interval-button.active {
    background: white;
    color: #333;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .unit-label {
    font-size: 13px;
    color: #777;
  }
</style>
