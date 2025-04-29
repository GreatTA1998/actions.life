<script>
  import PeriodicityInputs from '../Templates/components/TemplatePopup/PeriodicityInputs.svelte';
  import Task from '/src/lib/db/models/Task.js'

  export let taskObj

  let isPopupOpen = false
  let pendingRRStr = ''
  $: console.log("pendingRRStr =", pendingRRStr)

  function togglePopup() {
    isPopupOpen = !isPopupOpen
  }
</script>

<button on:click|stopPropagation={togglePopup} class="action-button material-symbols-outlined">
  autorenew
</button>

<!-- TO-DO: initial create is from this popup. Subseauent is preview + edit from the routines page -->
{#if isPopupOpen}
  <PeriodicityInputs initialRRStr="" on:update-rr={e => pendingRRStr = e.detail} />
{/if}


<style>
  .action-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 23px;
    color: rgb(20, 20, 20);
    position: relative;
  }
</style> 