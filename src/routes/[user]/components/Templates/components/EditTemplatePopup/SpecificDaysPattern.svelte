<script>
  import { createEventDispatcher, onMount } from 'svelte'
  
  export let rrStr = ''
  
  let selectedDays = new Set()
  let lastDaySelected = false

  const variableDays = [29, 30, 31]
  const dispatch = createEventDispatcher()
  
  $: if (rrStr) parseRRuleString(rrStr)
  $: lastDaySelected = variableDays.every(day => selectedDays.has(day))

  onMount(() => {
    if (rrStr) parseRRuleString(rrStr)
    selectedDays = selectedDays // Trigger reactivity
  })
  
  function toggleDay (day) {
    if (selectedDays.has(day)) {
      selectedDays.delete(day)
    } else {
      selectedDays.add(day)
    }
    
    selectedDays = selectedDays // Trigger reactivity
    dispatchChange()
  }
  
  function toggleAllVariableDays () {
    const areAllSelected = variableDays.every(day => selectedDays.has(day))
    
    if (areAllSelected) {
      variableDays.forEach(day => selectedDays.delete(day))
    } else {
      variableDays.forEach(day => selectedDays.add(day))
    }
    
    selectedDays = selectedDays // Trigger reactivity
    dispatchChange()
  }
  
  function parseRRuleString (rrStr) {
    if (!rrStr || !rrStr.includes('FREQ=MONTHLY') || !rrStr.includes('BYMONTHDAY=')) return false
    
    selectedDays.clear()
    
    const bymonthdayMatch = rrStr.match(/BYMONTHDAY=([^;]*)/)
    if (bymonthdayMatch) {
      const days = bymonthdayMatch[1].split(',').map(Number)
      days.forEach(day => selectedDays.add(day))
      selectedDays = selectedDays // Trigger reactivity
      return true
    }
    return false
  }
  
  function createRRuleString () {
    if (selectedDays.size > 0) {
      const days = Array.from(selectedDays).sort((a, b) => a - b)
      return `FREQ=MONTHLY;BYMONTHDAY=${days.join(',')}`
    }
    return ''
  }
  
  function dispatchChange () {
    const pattern = {
      type: 'specific',
      days: Array.from(selectedDays).sort((a, b) => a - b)
    }
    
    const newRRuleStr = createRRuleString()
    dispatch('update', { 
      pattern,
      rrStr: newRRuleStr
    })
  }
</script>

<div class="calendar-grid">
  {#each Array(28) as _, i}
    <button on:click={e => toggleDay(i+1, e)}
      class:selected={selectedDays.has(i+1)}
      class="day-button"
    >
      {i+1}
    </button>
  {/each}

  <button on:click={e => toggleAllVariableDays(e)}
    class:selected={lastDaySelected}
    class="day-button variable-group"
  >
    Last day
  </button>
</div>

<style>  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
    margin: 0 auto;

    /* width: 284px; */
     /* Fixed width for 7 columns of 38px + 2px gap */

    padding: 0.75rem;
    width: 100%;
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
  
  .selected {
    background: var(--active);
    color: white;
  }
  
  .day-button.variable-group {
    grid-column: span 3;
    width: auto;
    font-size: 0.85rem;
    font-weight: 500;
  }
</style> 