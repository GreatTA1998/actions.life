<script>
  import { getContext, createEventDispatcher, onMount } from 'svelte'
  import { parseMonthlyTypeI } from '$lib/utils/rrule.js'

  const inputStates = getContext('inputStates')
  const variableDays = [29, 30, 31]
  const dispatch = createEventDispatcher()
  
  let selectedDays = new Set()
  
  $: lastDaySelected = variableDays.every(day => selectedDays.has(day))
  $: dispatchChange(selectedDays)
  
  onMount(() => {
    selectedDays = parseMonthlyTypeI($inputStates['monthlyTypeI'])
  })

  function createRRuleString () {
    if (selectedDays.size > 0) {
      const days = Array.from(selectedDays).sort((a, b) => a - b)
      return `FREQ=MONTHLY;BYMONTHDAY=${days.join(',')}`
    }
    return ''
  }
  
  function toggleDay (day) {
    if (selectedDays.has(day)) selectedDays.delete(day)
    else selectedDays.add(day)
    selectedDays = selectedDays
  }
  
  function toggleAllVariableDays () {
    if (lastDaySelected) variableDays.forEach(day => selectedDays.delete(day))
    else variableDays.forEach(day => selectedDays.add(day))
    selectedDays = selectedDays
  }
  
  function dispatchChange () {
    dispatch('update', { 
      pattern: {
        type: 'specific',
        days: Array.from(selectedDays).sort((a, b) => a - b)
      },
      rrStr: createRRuleString()
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
    background: var(--selected);
    color: white;
  }
  
  .day-button.variable-group {
    grid-column: span 3;
    width: auto;
    font-size: 0.85rem;
    font-weight: 500;
  }
</style> 