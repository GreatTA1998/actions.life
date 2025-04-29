<script>
  import { createEventDispatcher } from 'svelte'
  import { weekdayToRRule, occurrenceToPosition, rruleToWeekday, positionToOccurrence } from './rruleUtils.js'
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
  let selectedOccurrences = new Set()

  onMount(() => {
    // Set default selection if no RRSTR is present and store doesn't have a value
    if (!$inputStates.monthlyTypeII) {
      selectedOccurrences.add('first')
      selectedOccurrences = selectedOccurrences
      dispatchChange()
    } else {
      parseRRuleString($inputStates.monthlyTypeII)
    }
  })

  function dispatchChange() {
    const pattern = {
      type: 'weekly',
      weekdays: selectedWeekdays,
      occurrences: Array.from(selectedOccurrences).sort()
    }
    
    const newRRuleStr = createRRuleString()
    dispatch('update', { 
      pattern,
      rrStr: newRRuleStr
    })
  }
  
  function toggleOccurrence(occurrence) {
    if (selectedOccurrences.has(occurrence)) {
      selectedOccurrences.delete(occurrence)
    } else {
      selectedOccurrences.add(occurrence)
    }
    selectedOccurrences = selectedOccurrences
    dispatchChange()
  }
  
  function toggleWeekday(weekdayId) {
    if (selectedWeekdays.includes(weekdayId)) {
      selectedWeekdays = selectedWeekdays.filter(day => day !== weekdayId)
    } else {
      selectedWeekdays = [...selectedWeekdays, weekdayId].sort()
    }
    dispatchChange()
  }
  
  function parseRRuleString(rrStr) {
    if (!rrStr || !rrStr.includes('FREQ=MONTHLY') || !rrStr.includes('BYDAY=')) return false
    
    selectedOccurrences.clear()
    selectedWeekdays = []
    
    const bydayMatch = rrStr.match(/BYDAY=([^;]*)/)
    if (bydayMatch) {
      const bydayParts = bydayMatch[1].split(',')
      
      const weekdaysFound = new Set()
      
      bydayParts.forEach(part => {
        const posMatch = part.match(/([+\-]\d+)([A-Z]{2})/)
        if (posMatch) {
          const pos = posMatch[1]
          const day = posMatch[2]
          
          // Convert position to occurrence id
          const occId = positionToOccurrence[pos]
          if (occId) {
            selectedOccurrences.add(occId)
          }
          
          // Add weekday to our selected weekdays
          const weekdayId = rruleToWeekday[day]
          if (weekdayId && !weekdaysFound.has(weekdayId)) {
            weekdaysFound.add(weekdayId)
            selectedWeekdays.push(weekdayId)
          }
        }
      })
      
      selectedWeekdays.sort()
      selectedOccurrences = selectedOccurrences
      return true
    }
    return false
  }
  
  function createRRuleString() {
    if (selectedOccurrences.size > 0 && selectedWeekdays.length > 0) {
      const bydays = []
      
      for (const occ of Array.from(selectedOccurrences).sort()) {
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
            class="occurrence-button {selectedOccurrences.has(occurrence.id) ? 'selected' : ''}"
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