<script>
  import { parseRecurrenceString, weeklyCrontabFromSelectedDays } from './recurrenceParser.js'
  
  const dayOfWeekSymbol = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  export let crontab
  export let rrStr = null
  
  let selectedDays = []
  
  $: {
    if (rrStr) {
      // Prioritize rrStr if available
      const parsed = parseRecurrenceString(rrStr)
      selectedDays = parsed.weeklyData.selectedDays
    } else if (crontab) {
      // Fall back to crontab parsing
      try {
        const weekdaysPart = crontab?.split(' ')[4]
        if (weekdaysPart) {
          // Convert from crontab format (1-7, where 1 is Monday, 7 is Sunday)
          // to our format (0-6, where 0 is Sunday)
          selectedDays = weekdaysPart.split(',')
            .map(day => parseInt(day))
            .map(day => day === 7 ? 0 : day)
            .filter(day => !isNaN(day) && day >= 0 && day <= 6)
        } else {
          selectedDays = []
        }
      } catch (e) {
        selectedDays = []
      }
    } else {
      selectedDays = []
    }
  }
  
  // Calculate effective crontab for visualization
  $: effectiveCrontab = rrStr ? weeklyCrontabFromSelectedDays(selectedDays) : crontab
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