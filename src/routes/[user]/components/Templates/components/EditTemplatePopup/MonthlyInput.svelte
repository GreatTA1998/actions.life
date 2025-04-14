<script>
  import { createEventDispatcher } from 'svelte'
  
  const dispatch = createEventDispatcher()
  
  // Currently selected pattern type
  let patternType = 'specific' // 'specific' or 'weekly'
  
  // Specific days selection
  let selectedDays = new Set()
  
  // Special day options
  let useLastDay = false
  
  // Weekly options
  let selectedWeekday = 'saturday'
  
  // Week occurrences (1st, 2nd, 3rd, 4th, last)
  let selectedOccurrences = new Set()
  const weekOccurrences = [
    { id: 'first', label: '1st', shortLabel: '1' },
    { id: 'second', label: '2nd', shortLabel: '2' },
    { id: 'third', label: '3rd', shortLabel: '3' },
    { id: 'fourth', label: '4th', shortLabel: '4' },
    { id: 'last', label: 'Last', shortLabel: 'L' }
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
  
  // Days that don't exist in all months
  const variableDays = [29, 30, 31]
  
  function toggleDay(day) {
    if (selectedDays.has(day)) {
      selectedDays.delete(day)
    } else {
      selectedDays.add(day)
    }
    
    // Uncheck "Last day" if a day is selected
    if (selectedDays.size > 0) {
      useLastDay = false
    }
    
    updateSelection()
  }
  
  function toggleLastDay() {
    useLastDay = !useLastDay
    
    // Clear selected days if "Last day" is checked
    if (useLastDay) {
      selectedDays.clear()
    }
    
    updateSelection()
  }
  
  function toggleOccurrence(occurrence) {
    if (selectedOccurrences.has(occurrence)) {
      selectedOccurrences.delete(occurrence)
    } else {
      selectedOccurrences.add(occurrence)
    }
    updateSelection()
  }
  
  function isVariableDay(day) {
    return variableDays.includes(day)
  }
  
  function getWeekdayLabel(id) {
    return weekdays.find(day => day.id === id)?.label || id
  }
  
  function getOccurrenceLabels() {
    return Array.from(selectedOccurrences)
      .map(id => weekOccurrences.find(o => o.id === id)?.label || id)
      .join(' and ')
  }
  
  function updateSelection() {
    let pattern
    
    if (patternType === 'specific') {
      if (useLastDay) {
        pattern = { type: 'monthly', day: -1 } // Last day of month
      } else if (selectedDays.size > 0) {
        pattern = Array.from(selectedDays).sort((a, b) => a - b)
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
      dispatch('update', { pattern })
    }
  }
  
  // Initialize with 2nd and 4th occurrence by default for weekly
  selectedOccurrences.add('second')
  selectedOccurrences.add('fourth')
  
  // Reactive statements
  $: if (patternType) updateSelection()
  $: if (selectedWeekday) updateSelection()
</script>

<div class="repeat-input">
  <div class="sections-container">
    <!-- Calendar & Monthly Options Section -->
    <section class="pattern-section">
      <div class="section-header">
        <label class="pattern-radio">
          <input type="radio" bind:group={patternType} value="specific">
          <span>Day of Month</span>
        </label>
      </div>
      
      <div class="section-content">
        <div class="calendar-grid">
          {#each Array(31) as _, i}
            {@const day = i + 1}
            <button 
              class="day-button {selectedDays.has(day) ? 'selected' : ''} {isVariableDay(day) ? 'variable' : ''}"
              on:click={() => toggleDay(day)}
              disabled={patternType !== 'specific'}
            >
              {day}
              {#if isVariableDay(day)}
                <span class="variable-indicator">*</span>
              {/if}
            </button>
          {/each}
        </div>
        
        <div class="special-options">
          <label class="option-item">
            <input 
              type="checkbox" 
              checked={useLastDay} 
              on:change={toggleLastDay}
              disabled={patternType !== 'specific'}
            >
            <span>Last day of month</span>
          </label>
        </div>
        
        <div class="helper-text">* Days marked with * don't exist in all months</div>
      </div>
    </section>
    
    <!-- Weekly Pattern Section -->
    <section class="pattern-section">
      <div class="section-header">
        <label class="pattern-radio">
          <input type="radio" bind:group={patternType} value="weekly">
          <span>Day of Week</span>
        </label>
      </div>
      
      <div class="section-content">
        <div class="weekly-selector">
          <div class="weekday-selector">
            <label>Day:</label>
            <select bind:value={selectedWeekday} disabled={patternType !== 'weekly'}>
              {#each weekdays as day}
                <option value={day.id}>{day.label}</option>
              {/each}
            </select>
          </div>
          
          <div class="occurrences">
            <label>Occurrences:</label>
            <div class="occurrence-buttons">
              {#each weekOccurrences as occurrence}
                <button 
                  class="occurrence-button {selectedOccurrences.has(occurrence.id) ? 'selected' : ''}"
                  on:click={() => toggleOccurrence(occurrence.id)}
                  title={occurrence.label}
                  disabled={patternType !== 'weekly'}
                >
                  {occurrence.shortLabel}
                </button>
              {/each}
            </div>
          </div>
          
          {#if selectedOccurrences.size > 0 && patternType === 'weekly'}
            <div class="example-text">
              {getOccurrenceLabels()} {getWeekdayLabel(selectedWeekday)} of each month
            </div>
          {/if}
        </div>
      </div>
    </section>
  </div>
</div>

<style>
  .repeat-input {
    border-radius: 8px;
    background: #fff;
  }
  
  .sections-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .pattern-section {
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .section-header {
    background: #f7f7f7;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid #ddd;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
  
  .section-content {
    padding: 0.75rem;
  }
  
  .pattern-radio {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: 500;
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.35rem;
    margin-bottom: 0.75rem;
  }
  
  .day-button {
    position: relative;
    padding: 0.5rem 0;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
  }
  
  .day-button:hover:not(:disabled) {
    background: #f5f5f5;
  }
  
  .day-button.selected {
    background: #007bff;
    color: white;
    border-color: #0056b3;
  }
  
  .day-button.variable {
    border-style: dashed;
    border-color: #ccc;
  }
  
  .day-button.variable.selected {
    background: #4da3ff;
    border-style: solid;
  }
  
  .day-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .variable-indicator {
    position: absolute;
    top: 0;
    right: 2px;
    font-size: 0.7rem;
    color: #ff7700;
  }
  
  .special-options {
    margin-bottom: 0.75rem;
  }
  
  .option-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem;
  }
  
  .weekly-selector {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .weekday-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .occurrences {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .occurrence-buttons {
    display: flex;
    gap: 0.25rem;
  }
  
  .occurrence-button {
    width: 2rem;
    height: 2rem;
    padding: 0;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    font-weight: 500;
  }
  
  .occurrence-button:hover:not(:disabled) {
    background: #f0f0f0;
  }
  
  .occurrence-button.selected {
    background: #007bff;
    color: white;
    border-color: #0056b3;
  }
  
  .occurrence-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  select {
    padding: 0.35rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: white;
  }
  
  select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .helper-text {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    color: #666;
  }
  
  .example-text {
    margin-top: 0.5rem;
    color: #555;
    font-style: italic;
  }
</style>