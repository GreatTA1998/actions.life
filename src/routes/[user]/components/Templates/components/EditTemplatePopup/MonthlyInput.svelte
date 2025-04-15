<script>
  import { createEventDispatcher } from 'svelte'
  import Template from '/src/lib/db/models/Template/index.js'
  import { user } from '/src/lib/store'
  import RoundButton from '$lib/components/RoundButton.svelte'
  import SpecificDaysPattern from './SpecificDaysPattern.svelte'
  import WeeklyPattern from './WeeklyPattern.svelte'
  
  const dispatch = createEventDispatcher()
  
  export let template
  
  let patternType = 'specific' // Default pattern type
  let isEditingPeriodicity = false
  let newRRuleStr = ''
  
  // Determine initial pattern type from template.rrStr
  if (template?.rrStr) {
    if (template.rrStr.includes('BYMONTHDAY=')) {
      patternType = 'specific'
    } else if (template.rrStr.includes('BYDAY=')) {
      patternType = 'weekly'
    }
  }
  
  function selectPatternType(type) {
    patternType = type
  }
  
  function handlePatternUpdate(event) {
    // Forward pattern update to parent
    dispatch('update', { pattern: event.detail.pattern })
    
    // Track if we have a new RRule that's different from the template
    newRRuleStr = event.detail.rrStr
    isEditingPeriodicity = template && template.rrStr !== newRRuleStr && newRRuleStr !== ''
  }
  
  function handleSave() {
    if (newRRuleStr) {
      Template.update({ 
        userID: $user.uid, 
        id: template.id, 
        updates: { rrStr: newRRuleStr } 
      })
      isEditingPeriodicity = false
    }
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