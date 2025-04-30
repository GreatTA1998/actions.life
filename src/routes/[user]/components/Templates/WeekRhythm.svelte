<script>
  import { toWeeklyIndices } from './recurrenceParser.js'
  import { crontabToState } from './crontab.js'

  const dayOfWeekSymbol = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  export let crontab
  export let rrStr = null
  
  let selectedDays = []
  
  $: {
    if (rrStr) {
      selectedDays = toWeeklyIndices(rrStr)
    } 
    else if (crontab) {
      ({ selectedDays } = crontabToState(crontab))
    }
  }
</script>

<div style="display: flex;">
  {#each dayOfWeekSymbol as _, i}
    <div
      class="day-of-week-circle"
      class:highlighted={selectedDays.includes(i)}
    ></div>
  {/each}
</div>

<style>
  .day-of-week-circle {
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