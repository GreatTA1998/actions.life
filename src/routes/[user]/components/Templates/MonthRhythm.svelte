<script>
  export let crontab

  // Parse the days from crontab (3rd field is day of month)
  $: selectedDays = crontab.split(' ')[2].split(',').map(Number).sort((a, b) => a - b)

  // Format days for display (e.g., "5th, 20th")
  $: daysText = selectedDays
    .map(day => `${day}${getOrdinalSuffix(day)}`)
    .join(', ')

  function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th'
    switch (day % 10) {
      case 1: return 'st'
      case 2: return 'nd'
      case 3: return 'rd'
      default: return 'th'
    }
  }
</script>

<div class="rhythm-container">
  <div class="rhythm-line">
    {#each selectedDays as day}
      <div 
        class="day-marker"
        style="left: calc({day / 31 * 100}%)"
      ></div>
    {/each}
  </div>
  <div class="days-text">{daysText}</div>
</div>

<style>
  .rhythm-container {
    width: 120px;
    display: flex;
    flex-direction: column;
    gap: 0px;
    padding: 0 3px;
    box-sizing: border-box;
  }

  .rhythm-line {
    height: 2px;
    background-color: rgb(223, 223, 223);
    position: relative;
    margin: 8px 0;
  }

  .day-marker {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: darkslategrey;
    top: -2px;
    transform: translateX(-50%);
  }

  .days-text {
    font-size: 10px;
    color: rgb(80, 80, 80);
  }
</style> 