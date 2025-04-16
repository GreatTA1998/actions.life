<script>
  import { createEventDispatcher } from 'svelte'
  import SpecificDaysPattern from './SpecificDaysPattern.svelte'
  import WeeklyPattern from './WeeklyPattern.svelte'
  
  export let template

  const dispatch = createEventDispatcher()
  
  let patternType = 'specific' // Default pattern type
  let isEditing = false
  let byWeekNumberRR = ''
  let byMonthDayRR = ''
  
  if (template.rrStr) {
    if (template.rrStr.includes('BYMONTHDAY=')) {
      patternType = 'specific'
    } else if (template.rrStr.includes('BYDAY=')) {
      patternType = 'weekly'
    }
  }
  
  function selectPatternType(type) {
    patternType = type
    dispatch('rruleChange', { 
      rrStr: patternType === 'specific' ? byMonthDayRR : byWeekNumberRR
    })
  }
  
  function handlePatternUpdate (e) {
    if (patternType === 'specific') byMonthDayRR = e.detail.rrStr
    else if (patternType === 'weekly') byWeekNumberRR = e.detail.rrStr
    
    isEditing = template.rrStr !== e.detail.rrStr
    dispatch('rruleChange', { 
      rrStr: e.detail.rrStr 
    })
  }
</script>

<div class="repeat-input">
  <div class="sections-container">
    <div class="options-row">
      <section 
        class="pattern-section {patternType === 'specific' ? 'active' : ''}"
        on:click={() => selectPatternType('specific')} on:keydown
      >
        <SpecificDaysPattern 
          rrStr={template?.rrStr || ''}
          on:update={handlePatternUpdate}
        />
      </section>
      
      <!-- Weekly Pattern Section -->
      <section 
        on:click={() => selectPatternType('weekly')} on:keydown
        class="pattern-section {patternType === 'weekly' ? 'active' : ''}"
      >
        <WeeklyPattern 
          rrStr={template?.rrStr || ''}
          on:update={handlePatternUpdate}
        />
      </section>
    </div>
  </div>
</div>

<style>
  :root {
    --selected: orange;
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
</style>