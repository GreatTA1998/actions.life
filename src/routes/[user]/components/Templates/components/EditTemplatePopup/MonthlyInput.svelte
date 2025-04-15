<script>
  import { createEventDispatcher } from 'svelte'
  import Template from '/src/lib/db/models/Template/index.js'
  import { user } from '/src/lib/store'
  import RoundButton from '$lib/components/RoundButton.svelte'
  import SpecificDaysPattern from './SpecificDaysPattern.svelte'
  import WeeklyPattern from './WeeklyPattern.svelte'
  
  const dispatch = createEventDispatcher()
  
  export let initialPattern = null
  export let template
  
  let patternType = 'specific' // 'specific' or 'weekly'
  let selectedDays = new Set()
  let selectedWeekday = 'saturday'
  let selectedOccurrences = new Set()
  
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
  
  let isEditingPeriodicity = false
  let currentPattern = null

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
  
  function handleSpecificDaysUpdate(event) {
    selectedDays = event.detail.selectedDays
    updateSelection()
  }
  
  function handleWeeklyPatternUpdate(event) {
    if (event.detail.selectedWeekday) {
      selectedWeekday = event.detail.selectedWeekday
    }
    if (event.detail.selectedOccurrences) {
      selectedOccurrences = event.detail.selectedOccurrences
    }
    updateSelection()
  }
  
  // Run initialization once
  initializeDefaults()
  
  // Reactive statements to ensure UI updates
  $: if (patternType) updateSelection()
</script>

<div class="repeat-input">
  <div class="sections-container">
    <div class="options-row">
      <section 
        class="pattern-section {patternType === 'specific' ? 'active' : ''}"
        on:click={() => selectPatternType('specific')} on:keydown
      >
        <SpecificDaysPattern 
          bind:selectedDays={selectedDays}
          on:update={handleSpecificDaysUpdate}
        />
      </section>
      
      <!-- Weekly Pattern Section -->
      <section 
        on:click={() => selectPatternType('weekly')} on:keydown
        class="pattern-section {patternType === 'weekly' ? 'active' : ''}"
      >
        <WeeklyPattern 
          bind:selectedWeekday={selectedWeekday}
          bind:selectedOccurrences={selectedOccurrences}
          on:update={handleWeeklyPatternUpdate}
        />
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
  
  .save-button-container {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }
</style>