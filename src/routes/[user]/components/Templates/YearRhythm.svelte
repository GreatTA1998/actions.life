<script>
  import { crontabToState } from './crontab.js';
  import { parseYearly } from './recurrenceParser.js'
  
  export let crontab
  export let rrStr = null

  const monthAbbrev = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

  let selectedDays = []
  let selectedMonths = []

  $: {
    if (rrStr) {
      const { mmdd, year } = parseYearly(rrStr)
      const [MM, dd] = mmdd.split('/')
      selectedMonths = [MM]
      selectedDays = [dd]
    } else if (crontab) {
      ({ selectedMonths, selectedDays } = crontabToState(crontab))
    }
  }

  // Get month-day combinations for display
  $: dateText = selectedMonths.length && selectedDays.length ? 
    selectedMonths
      .map((month, i) => {
        const day = i < selectedDays.length ? selectedDays[i] : selectedDays[0]
        if (!month || !day || month < 1 || month > 12) return ''
        return `${monthAbbrev[month - 1]} ${day}`
      })
      .filter(text => text)
      .join(', ') : ''
</script>

<div class="rhythm-container">
  <div class="rhythm-line">
    {#each selectedMonths as month}
      {#if month >= 1 && month <= 12}
        <div 
          class="month-marker"
          style="left: calc({(month - 1) / 12 * 100}% - 3px)"
        ></div>
      {/if}
    {/each}
  </div>
  <div class="months-text">{dateText || 'Not scheduled'}</div>
</div>

<style>
  .rhythm-container {
    width: 160px;  /* Increased width to accommodate longer text */
    display: flex;
    flex-direction: column;
    gap: 0px;
  }

  .rhythm-line {
    height: 2px;
    background-color: rgb(223, 223, 223);
    position: relative;
    margin-top: 8px;
    margin-bottom: 4px;
  }

  .month-marker {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--rhythm-highlight-color);
    top: -2px;
  }

  .months-text {
    font-size: 10px;
    color: rgb(80, 80, 80);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>