<script>
  import { createEventDispatcher } from 'svelte'
  
  const dispatch = createEventDispatcher()
  
  export let selectedDays = new Set()
  
  const variableDays = [29, 30, 31]
  let lastDaySelected = false
  
  function toggleDay(day, event) {
    if (selectedDays.has(day)) {
      selectedDays.delete(day)
    } else {
      selectedDays.add(day)
    }
    
    selectedDays = selectedDays // Trigger reactivity
    dispatch('update', { selectedDays })
  }
  
  function toggleAllVariableDays(event) {
    const areAllSelected = variableDays.every(day => selectedDays.has(day))
    
    if (areAllSelected) {
      variableDays.forEach(day => selectedDays.delete(day))
    } else {
      variableDays.forEach(day => selectedDays.add(day))
    }
    
    selectedDays = selectedDays // Trigger reactivity
    dispatch('update', { selectedDays })
  }
  
  $: lastDaySelected = variableDays.every(day => selectedDays.has(day))
</script>

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

<style>
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
</style> 