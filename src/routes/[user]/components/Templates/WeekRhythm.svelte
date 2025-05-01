<script>
  import { toWeeklyIndices } from '$lib/utils/rrule.js'

  const dayOfWeekSymbol = [, 'M', 'T', 'W', 'T', 'F', 'S', 'S']

  export let rrStr = null
  
  let selectedDays = []
  
  $: selectedDays = toWeeklyIndices(rrStr)
</script>

<div style="display: flex;">
  {#each dayOfWeekSymbol as _, i}
    {#if i !== 0}
      <div class="circle" class:highlighted={selectedDays.includes(i)}></div>
    {/if}
  {/each}
</div>

<style>
  .circle {
    border-radius: 50%;
    background-color: rgb(223, 223, 223);
    width: 6px;
    height: 6px;
    margin: 2px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: 1px solid rgb(111, 111, 111);
  }

  .highlighted {
    background-color: var(--rhythm-highlight-color);
    border: none;
  }
</style>