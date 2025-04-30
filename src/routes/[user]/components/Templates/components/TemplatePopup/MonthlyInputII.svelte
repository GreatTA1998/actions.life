<script>
  import { parseMonthlyTypeII } from '/src/routes/[user]/components/Templates/recurrenceParser.js'
  import { createEventDispatcher } from 'svelte'
  import { weekdayToRRule, occurrenceToPosition } from './rruleUtils.js'
  import { getContext, onMount } from 'svelte'

  const inputStates = getContext('inputStates')

  const weekOccurrences = [
    { id: 'first', label: '1st' },
    { id: 'second', label: '2nd' },
    { id: 'third', label: '3rd' },
    { id: 'fourth', label: '4th' }
  ]
  
  const weekdays = [
    { id: 'monday', shortLabel: 'Mo' },
    { id: 'tuesday', shortLabel: 'Tu' },
    { id: 'wednesday', shortLabel: 'We' },
    { id: 'thursday', shortLabel: 'Th' },
    { id: 'friday', shortLabel: 'Fr' },
    { id: 'saturday', shortLabel: 'Sa' },
    { id: 'sunday', shortLabel: 'Su' }
  ]
  const dispatch = createEventDispatcher()
  
  let selectedWeekdays = []
  let weekPos = new Set()

  $: dispatchChange(weekPos, selectedWeekdays)

  onMount(() => {
    if (!$inputStates.monthlyTypeII) {
      weekPos.add('first')
      weekPos = weekPos
    } else {
      parseRRuleString($inputStates.monthlyTypeII)
    }
  })

  function dispatchChange() {
    const pattern = {
      type: 'weekly',
      weekdays: selectedWeekdays,
      occurrences: Array.from(weekPos).sort()
    }
    
    const newRRuleStr = createRRuleString()
    dispatch('update', { 
      pattern,
      rrStr: newRRuleStr
    })
  }
  
  function toggleOccurrence(occurrence) {
    if (weekPos.has(occurrence)) weekPos.delete(occurrence)
    else weekPos.add(occurrence)
    weekPos = weekPos
  }
  
  function toggleWeekday(weekdayId) {
    if (selectedWeekdays.includes(weekdayId)) {
      selectedWeekdays = selectedWeekdays.filter(day => day !== weekdayId)
    } else {
      selectedWeekdays = [...selectedWeekdays, weekdayId].sort()
    }
  }
  
  function parseRRuleString (rrStr) {
    const result = parseMonthlyTypeII(rrStr)
    weekPos = result.weekPos
    selectedWeekdays = result.selectedWeekdays
  }
  
  function createRRuleString() {
    if (weekPos.size > 0 && selectedWeekdays.length > 0) {
      const bydays = []
      
      for (const occ of Array.from(weekPos).sort()) {
        for (const weekday of selectedWeekdays) {
          bydays.push(`${occurrenceToPosition[occ]}${weekdayToRRule[weekday]}`)
        }
      }
      
      return `FREQ=MONTHLY;BYDAY=${bydays.join(',')}`
    }
    return ''
  }
</script>

<div class="section-content">
  <div class="weekly-selector">  
    <div class="occurrences">
      <div>Every</div>
      <div class="occurrence-buttons">
        {#each weekOccurrences as occurrence}
          <button on:click={() => toggleOccurrence(occurrence.id)}
            class="occurrence-button {weekPos.has(occurrence.id) ? 'selected' : ''}"
            title={occurrence.label}
          >
            {occurrence.label}
          </button>
        {/each}
      </div>
    </div>

    <div class="weekday-selector">
      {#each weekdays as day}
        <button on:click={() => toggleWeekday(day.id)}
          class="circle {selectedWeekdays.includes(day.id) ? 'selected' : ''}" 
        >
          {day.shortLabel}
        </button>
      {/each}
    </div>

    <div style="margin-left: auto; margin-right: 0;">
      of each month
    </div>
  </div>
</div>

<style>
  .circle {
    width: 34px;
    height: 34px;
    line-height: 34px;
    border-radius: 50%;
    font-size: 12px;
    text-align: center;
    cursor: pointer;
    border: 1px solid #ccc;
    background: white;
    padding: 0;
  }
  
  .circle.selected {
    background: var(--active);
    color: white;
    border-color: var(--active);
  }
  
  .section-content {
    padding: 0.75rem;
    width: 100%;
  }
  
  .weekly-selector {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 284px;
  }
  
  .weekday-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 0.5rem 0;
    justify-content: center;
  }
  
  .occurrences {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .occurrence-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .occurrence-button {
    width: 2rem;
    height: 2rem;
    background: white;
    cursor: pointer;
    font-weight: 500;
    font-size: 1rem;
    color: #aaa;
    border-bottom: 2px solid #ccc;
  }
  
  .occurrence-button.selected {
    color: var(--active);
    border-color: var(--active);
  }
</style> 