<script>
  import { onMount, createEventDispatcher } from 'svelte'
  import { weekdayToRRule, occurrenceToPosition, rruleToWeekday, positionToOccurrence } from './rruleUtils.js'
  
  const dispatch = createEventDispatcher()
  
  export let rrStr = ''
  
  let selectedWeekday = 'saturday'
  let selectedOccurrences = new Set()
  
  const weekOccurrences = [
    { id: 'first', label: '1st', shortLabel: '1' },
    { id: 'second', label: '2nd', shortLabel: '2' },
    { id: 'third', label: '3rd', shortLabel: '3' },
    { id: 'fourth', label: '4th', shortLabel: '4' }
  ]
  
  const weekdays = [
    { id: 'monday', label: 'Monday', shortLabel: 'Mo' },
    { id: 'tuesday', label: 'Tuesday', shortLabel: 'Tu' },
    { id: 'wednesday', label: 'Wednesday', shortLabel: 'We' },
    { id: 'thursday', label: 'Thursday', shortLabel: 'Th' },
    { id: 'friday', label: 'Friday', shortLabel: 'Fr' },
    { id: 'saturday', label: 'Saturday', shortLabel: 'Sa' },
    { id: 'sunday', label: 'Sunday', shortLabel: 'Su' }
  ]

  $: if (rrStr) parseRRuleString(rrStr)

  onMount(() => {
    if (rrStr) {
      parseRRuleString(rrStr)
    }
    selectedOccurrences = selectedOccurrences // Trigger reactivity
  })
  
  function toggleOccurrence (occurrence) {
    if (selectedOccurrences.has(occurrence)) {
      selectedOccurrences.delete(occurrence)
    } else {
      selectedOccurrences.add(occurrence)
    }
    selectedOccurrences = selectedOccurrences // Trigger reactivity
    dispatchChange()
  }
  
  function selectWeekday (weekdayId, event) {
    selectedWeekday = weekdayId
    dispatchChange()
  }
  
  // Parse RRule string to extract weekly pattern
  function parseRRuleString (rrStr) {
    if (!rrStr || !rrStr.includes('FREQ=MONTHLY') || !rrStr.includes('BYDAY=')) return false
    
    selectedOccurrences.clear()
    
    const bydayMatch = rrStr.match(/BYDAY=([^;]*)/)
    if (bydayMatch) {
      const bydayParts = bydayMatch[1].split(',')
      
      // We only need to set the weekday once - we'll use the first one found
      let weekdaySet = false
      
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
          
          // Convert day code to weekday id and set it once
          if (!weekdaySet) {
            const weekdayId = rruleToWeekday[day]
            if (weekdayId) {
              selectedWeekday = weekdayId
              weekdaySet = true
            }
          }
        }
      })
      
      selectedOccurrences = selectedOccurrences // Trigger reactivity
      return true
    }
    return false
  }
  
  // Create RRule string for weekly pattern
  function createRRuleString () {
    if (selectedOccurrences.size > 0) {
      const bydays = Array.from(selectedOccurrences)
        .sort()
        .map(occ => `${occurrenceToPosition[occ]}${weekdayToRRule[selectedWeekday]}`)
        .join(',')
      
      return `FREQ=MONTHLY;BYDAY=${bydays}`
    }
    return ''
  }
  
  function dispatchChange () {
    const pattern = {
      type: 'weekly',
      weekday: selectedWeekday,
      occurrences: Array.from(selectedOccurrences).sort()
    }
    
    const newRRuleStr = createRRuleString()
    dispatch('update', { 
      pattern,
      rrStr: newRRuleStr
    })
  }
</script>

<div class="section-content">
  <div class="weekly-selector">  
    <div class="occurrences">
      <div>Every</div>
      <div class="occurrence-buttons">
        {#each weekOccurrences as occurrence}
          <button on:click={(e) => toggleOccurrence(occurrence.id, e)}
            type="button"
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
        <button on:click={(e) => selectWeekday(day.id, e)}
          type="button"
          class="circle {selectedWeekday === day.id ? 'selected' : ''}" 
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
    width: 284px; /* Match the width of the calendar grid */
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
    gap: 6px;
  }
  
  .occurrence-button {
    width: 2.2rem;
    height: 2.2rem;
    padding: 0;
    background: white;
    cursor: pointer;
    font-weight: 500;
    color: #aaa;
    border-bottom: 1px solid #ccc;
  }
  
  .occurrence-button.selected {
    color: var(--active);
    border-color: var(--active);
  }
</style> 