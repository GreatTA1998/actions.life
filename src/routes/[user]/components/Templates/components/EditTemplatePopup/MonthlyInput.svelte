<script>
  import { createEventDispatcher } from 'svelte'
  import Template from '/src/lib/db/models/Template/index.js'
  import { user } from '/src/lib/store'
  import RoundButton from '$lib/components/RoundButton.svelte'
  
  const dispatch = createEventDispatcher()
  
  export let initialPattern = null
  export let template
  
  let patternType = 'specific' // 'specific' or 'weekly'
  let selectedDays = new Set()
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
  
  const variableDays = [29, 30, 31]
  let lastDaySelected = false
  let isEditingPeriodicity = false
  let currentPattern = null

  const weekdayToRRule = {
    monday: 'MO',
    tuesday: 'TU',
    wednesday: 'WE',
    thursday: 'TH',
    friday: 'FR',
    saturday: 'SA',
    sunday: 'SU'
  }
  
  const occurrenceToPosition = {
    first: '+1',
    second: '+2',
    third: '+3',
    fourth: '+4'
  }
  
  // Initialize with some defaults
  function initializeDefaults() {
    // Default for specific days
    selectedDays.add(1)
    
    // Default for weekly
    selectedOccurrences.add('second')
    selectedOccurrences.add('fourth')
    
    // Apply initial pattern if provided
    if (initialPattern) {
      if (initialPattern.type === 'specific') {
        patternType = 'specific'
        selectedDays.clear()
        
        if (initialPattern.days) {
          initialPattern.days.forEach(day => selectedDays.add(day))
        }
      } 
      else if (initialPattern.type === 'weekly') {
        patternType = 'weekly'
        
        if (initialPattern.weekday) {
          selectedWeekday = initialPattern.weekday
        }
        
        if (initialPattern.occurrences) {
          selectedOccurrences.clear()
          initialPattern.occurrences.forEach(occ => selectedOccurrences.add(occ))
        }
      }
    }
    
    // Try to parse from existing rrule if available
    if (template && template.rrStr) {
      parseRRuleString(template.rrStr)
    }
    
    // Trigger reactivity
    selectedDays = selectedDays
    selectedOccurrences = selectedOccurrences
    
    updateSelection()
  }
  
  // Parse rrule string to set component state
  function parseRRuleString(rrStr) {
    if (!rrStr || !rrStr.includes('FREQ=MONTHLY')) return
    
    if (rrStr.includes('BYMONTHDAY=')) {
      // Specific days pattern
      patternType = 'specific'
      selectedDays.clear()
      
      const bymonthdayMatch = rrStr.match(/BYMONTHDAY=([^;]*)/)
      if (bymonthdayMatch) {
        const days = bymonthdayMatch[1].split(',').map(Number)
        days.forEach(day => selectedDays.add(day))
      }
    } 
    else if (rrStr.includes('BYDAY=')) {
      // Weekly pattern
      patternType = 'weekly'
      selectedOccurrences.clear()
      
      const bydayMatch = rrStr.match(/BYDAY=([^;]*)/)
      if (bydayMatch) {
        const bydayParts = bydayMatch[1].split(',')
        
        bydayParts.forEach(part => {
          const posMatch = part.match(/([+\-]\d+)([A-Z]{2})/)
          if (posMatch) {
            const pos = posMatch[1]
            const day = posMatch[2]
            
            // Convert position to occurrence id
            const occId = Object.entries(occurrenceToPosition)
              .find(([_, val]) => val === pos)?.[0]
            
            if (occId) {
              selectedOccurrences.add(occId)
            }
            
            // Convert day code to weekday id
            const weekdayId = Object.entries(weekdayToRRule)
              .find(([_, val]) => val === day)?.[0]
            
            if (weekdayId) {
              selectedWeekday = weekdayId
            }
          }
        })
      }
    }
  }
  
  // Create rrule string from current selection
  function createRRuleString() {
    if (patternType === 'specific' && selectedDays.size > 0) {
      const days = Array.from(selectedDays).sort((a, b) => a - b)
      return `FREQ=MONTHLY;BYMONTHDAY=${days.join(',')}`
    } 
    else if (patternType === 'weekly' && selectedOccurrences.size > 0) {
      const bydays = Array.from(selectedOccurrences)
        .sort()
        .map(occ => `${occurrenceToPosition[occ]}${weekdayToRRule[selectedWeekday]}`)
        .join(',')
      
      return `FREQ=MONTHLY;BYDAY=${bydays}`
    }
    
    return ''
  }
  
  function toggleDay(day, event) {
    if (selectedDays.has(day)) {
      selectedDays.delete(day)
    } else {
      selectedDays.add(day)
    }
    
    selectedDays = selectedDays // Trigger reactivity
  }
  
  function toggleAllVariableDays(event) {
    const areAllSelected = variableDays.every(day => selectedDays.has(day))
    
    if (areAllSelected) {
      variableDays.forEach(day => selectedDays.delete(day))
    } else {
      variableDays.forEach(day => selectedDays.add(day))
    }
    
    selectedDays = selectedDays // Trigger reactivity
  }
  
  function toggleOccurrence(occurrence, event) {
    if (selectedOccurrences.has(occurrence)) {
      selectedOccurrences.delete(occurrence)
    } else {
      selectedOccurrences.add(occurrence)
    }
    selectedOccurrences = selectedOccurrences // Trigger reactivity
  }
  
  function selectWeekday(weekdayId, event) {
    selectedWeekday = weekdayId
  }
  
  function selectPatternType(type, event) {
    patternType = type
  }
  
  function updateSelection() {
    let pattern
    
    if (patternType === 'specific') {
      if (selectedDays.size > 0) {
        // Simple array of selected days
        pattern = {
          type: 'specific',
          days: Array.from(selectedDays).sort((a, b) => a - b)
        }
      }
    } 
    else if (patternType === 'weekly') {
      // Only dispatch if at least one occurrence is selected
      if (selectedOccurrences.size > 0) {
        pattern = {
          type: 'weekly',
          weekday: selectedWeekday,
          occurrences: Array.from(selectedOccurrences).sort()
        }
      }
    }
    
    if (pattern) {
      currentPattern = pattern
      dispatch('update', { pattern })
      
      // Check if editing
      const newRRuleStr = createRRuleString()
      isEditingPeriodicity = template && template.rrStr !== newRRuleStr && newRRuleStr !== ''
    }
  }
  
  function handleSave() {
    const rrStr = createRRuleString()
    if (rrStr) {
      console.log('rrStr =', rrStr)
      Template.update({ 
        userID: $user.uid, 
        id: template.id, 
        updates: { rrStr } 
      })
      isEditingPeriodicity = false
    }
  }
  
  // Run initialization once
  initializeDefaults()
  
  // Reactive statements to ensure UI updates
  $: if (patternType) updateSelection()
  $: lastDaySelected = variableDays.every(day => selectedDays.has(day))
</script>

<div class="repeat-input">
  <div class="sections-container">
    <div class="options-row">
      <section 
        class="pattern-section {patternType === 'specific' ? 'active' : ''}"
        on:click={() => selectPatternType('specific')} on:keydown
      >
        <div class="section-content">
          <div class="calendar-grid">
            {#each Array(28) as _, i}
              {@const day = i + 1}
              <button on:click={(e) => toggleDay(day, e)}
                type="button"
                class="day-button {selectedDays.has(day) ? 'selected' : ''}"
              >
                {day}
              </button>
            {/each}
            
            <!-- Last Days Group (29-31) -->
            <button 
              type="button"
              class="day-button variable-group {variableDays.some(day => selectedDays.has(day)) ? 'selected' : ''} {lastDaySelected ? 'all-selected' : ''}"
              on:click={(e) => toggleAllVariableDays(e)}
              title="Select last days (29, 30, 31)"
            >
              Last day
            </button>
            
            <!-- Individual variable days (hidden but tracked for state) -->
            {#each variableDays as day}
              <div class="hidden-day">
                {#if selectedDays.has(day)}
                  <!-- Hidden marker to track state -->
                {/if}
              </div>
            {/each}
          </div>
        </div>
      </section>
      
      <!-- Weekly Pattern Section -->
      <section 
        class="pattern-section {patternType === 'weekly' ? 'active' : ''}"
        on:click={() => selectPatternType('weekly')} on:keydown
      >
        <div class="section-content">
          <div class="weekly-selector">  
            <div class="occurrences">
              <div>Every</div>
              <div class="occurrence-buttons">
                {#each weekOccurrences as occurrence}
                  <button 
                    type="button"
                    class="occurrence-button {selectedOccurrences.has(occurrence.id) ? 'selected' : ''}"
                    on:click={(e) => toggleOccurrence(occurrence.id, e)}
                    title={occurrence.label}
                  >
                    {occurrence.label}
                  </button>
                {/each}
              </div>
            </div>

            <div class="weekday-selector">
              {#each weekdays as day}
                <button 
                  type="button"
                  class="circle {selectedWeekday === day.id ? 'selected' : ''}" 
                  on:click={(e) => selectWeekday(day.id, e)}
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
      </section>
    </div>
  </div>
  
  {#if isEditingPeriodicity}
    <div class="save-button-container">
      <RoundButton
        on:click={handleSave}
        backgroundColor="rgb(0, 89, 125)"
        textColor="white"
      >
        Save changes
      </RoundButton>
    </div>
  {/if}
</div>

<style>
  :root {
    --active: orange;
  }

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

  .repeat-input {
    border-radius: 8px;
    background: #fff;
    width: 100%;
  }
  
  .sections-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .options-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    align-items: start;
  }
  
  .pattern-section {
    border-radius: 4px;
    border: 2px solid rgb(238, 238, 238);
    width: auto;
    transition: all 0.2s;
    cursor: pointer;
    position: relative;
    opacity: 0.4;
  }
  
  .pattern-section.active {
    border: 2px solid var(--active);
    opacity: 1;
  }
  
  .section-content {
    padding: 0.75rem;
    width: 100%;
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    margin: 0 auto;
    width: 284px; /* Fixed width for 7 columns of 38px + 2px gap */
  }
  
  .day-button {
    position: relative;
    width: 38px;
    height: 38px;
    padding: 0;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .day-button.selected {
    background: var(--active);
    color: white;
  }

  
  .day-button.variable-group {
    grid-column: span 3;
    width: auto;
    font-size: 0.85rem;
    font-weight: 500;
  }
  
  .day-button.variable-group.selected {
    background: var(--active);
    color: white;
  }
  
  .day-button.variable-group.all-selected {
    background: var(--active);
  }
  
  .hidden-day {
    display: none;
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
  
  .save-button-container {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }
</style>