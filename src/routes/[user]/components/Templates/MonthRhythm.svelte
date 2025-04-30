<script>
  import { parseMonthlyTypeI } from './recurrenceParser.js'
  import { rruleToWeekday, positionToOccurrence } from './components/TemplatePopup/rruleUtils.js'
  import { crontabToState } from './crontab.js'
  
  export let crontab
  export let rrStr = null
  
  let selectedDays = []
  let isWeeklyPattern = false
  let weeklyDescription = ''
  
  const weekdayShortNames = {
    'monday': 'Mon',
    'tuesday': 'Tue',
    'wednesday': 'Wed',
    'thursday': 'Thu',
    'friday': 'Fri',
    'saturday': 'Sat',
    'sunday': 'Sun'
  }
  
  const ordinalLabels = {
    'first': '1st',
    'second': '2nd',
    'third': '3rd',
    'fourth': '4th'
  }
  
  $: {
    if (rrStr) {
      // Check if this is a weekly pattern (BYDAY with position numbers)
      if (rrStr.includes('FREQ=MONTHLY') && rrStr.includes('BYDAY=')) {
        isWeeklyPattern = true
        weeklyDescription = createWeeklyDescription(rrStr)
        selectedDays = [] // No days to display in the line
      } 
      else { // Regular monthly pattern
        isWeeklyPattern = false
        selectedDays = [...parseMonthlyTypeI(rrStr)]
        console.log("selectedDays after parsing =", selectedDays)
      }
    } 
    else if (crontab) {
      const result = crontabToState(crontab)
      isWeeklyPattern = false
      selectedDays = result.selectedDays
    } 
    else {
      console.log("unknown pattern")
      isWeeklyPattern = false
      selectedDays = []
    }
  }
  
  // Format days for display (e.g., "5th, 20th")
  $: daysText = selectedDays.length > 0 
    ? selectedDays
        .map(day => `${day}${getOrdinalSuffix(day)}`)
        .join(', ')
    : 'Not scheduled'
  
  // Create a natural language description for weekly patterns
  function createWeeklyDescription(rrStr) {
    const bydayMatch = rrStr.match(/BYDAY=([^;]*)/)
    if (!bydayMatch) return 'Not scheduled'
    
    const bydayParts = bydayMatch[1].split(',')
    if (bydayParts.length === 0) return 'Not scheduled'
    
    // Extract positions and weekday
    let weekday = ''
    const positions = []
    
    bydayParts.forEach(part => {
      const posMatch = part.match(/([+\-]\d+)([A-Z]{2})/)
      if (posMatch) {
        const pos = posMatch[1]
        const day = posMatch[2]
        
        // Only need the weekday once
        if (!weekday) {
          // Convert from RRule code to weekday then to short name
          const weekdayId = rruleToWeekday[day]
          weekday = weekdayId ? weekdayShortNames[weekdayId] : day
        }
        
        // Convert from position to occurrence then to ordinal label
        const occId = positionToOccurrence[pos]
        const ordinal = occId ? ordinalLabels[occId] : pos
        
        if (ordinal) {
          positions.push(ordinal)
        }
      }
    })
    
    if (positions.length === 0 || !weekday) return 'Not scheduled'
    
    // Format the positions with proper conjunction
    let positionsText
    if (positions.length === 1) {
      positionsText = positions[0]
    } else if (positions.length === 2) {
      positionsText = `${positions[0]} & ${positions[1]}`
    } else {
      const lastPos = positions.pop()
      positionsText = `${positions.join(', ')} & ${lastPos}`
    }
    
    return `${positionsText} ${weekday}`
  }

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
  {#if isWeeklyPattern}
    <div class="weekly-text">
      {weeklyDescription}
    </div>
  {:else}
    <div class="rhythm-line">
      {#each selectedDays as day}
        <div 
          class="day-marker"
          style="left: calc({day / 31 * 100}%)"
        ></div>
      {/each}
    </div>
    <div class="days-text">{daysText}</div>
  {/if}
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
    background-color: var(--rhythm-highlight-color);
    top: -2px;
    transform: translateX(-50%);
  }

  .days-text, .weekly-text {
    font-size: 10px;
    color: rgb(80, 80, 80);
  }
  
  .weekly-text {
    margin-top: 5px;
  }
</style> 