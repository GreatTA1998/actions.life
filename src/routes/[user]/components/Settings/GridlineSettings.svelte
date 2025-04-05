<script>
  import { updateFirestoreDoc } from '/src/lib/db/helpers.js'
  import { user, calSnapInterval } from '/src/lib/store'

  const snapIntervals = [1, 5, 10, 15, 30]

  function updateSettings (interval) {
    updateFirestoreDoc(`users/${$user.uid}`, { calSnapInterval: interval })
  }

  function toggleGridlines () {
    updateFirestoreDoc(`users/${$user.uid}`, { 
      hasGridlines: !$user.hasGridlines 
    })
  }

</script>

<div style='display: flex; align-items: center; column-gap: 4px;'>
  <div on:click|stopPropagation={toggleGridlines}>
    Show gridlines for calendar (otherwise click will propagate)
  </div>
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
