<script>
  import { updateFirestoreDoc } from "/src/helpers/firebase.js";
  import { user, calSnapInterval } from '/src/store'

  const snapIntervals = [1, 5, 10, 15, 30]

  function updateSettings (interval) {
    updateFirestoreDoc(`users/${$user.uid}`, { calSnapInterval: interval })
  }
</script>

<div style='display: flex; align-items: center; column-gap: 4px;'>
  <input type="checkbox" bind:checked={$user.hasGridlines} 
    on:change={e => updateFirestoreDoc(`users/${$user.uid}`, { hasGridlines: e.target.checked }
  )}/>
  Show gridlines for calendar
</div>

<div style="display: flex; align-items: center; column-gap: 4px;">
  <span>Snap to nearest</span>
  <div style="display: flex; align-items: center; column-gap: 4px;">
    {#each snapIntervals as interval}
      <button on:click={() => updateSettings(interval)} class:highlighted={$calSnapInterval === interval} class="button-choice">
        {interval}
      </button>
    {/each}
  </div>
  <span>minutes</span>
</div>

<style>
  .button-choice {
    padding: 4px;
    border-radius: 4px;
    border: 1px solid #000;
  }

  .highlighted {
    background-color: grey;
    color: white;
  }
</style>
