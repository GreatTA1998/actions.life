<script>
  import MonthlyInputI from './MonthlyInputI.svelte'
  import MonthlyInputII from './MonthlyInputII.svelte'
  import { getContext } from 'svelte' 

  const inputStates = getContext('inputStates')
  const monthlyPointer = getContext('monthlyPointer')
  
  function selectPatternType (type) {
    monthlyPointer.set(type)
  }

  function updateState (type, e) {
    inputStates.update(states => ({ ...states, [type]: e.detail.rrStr }))
  }
</script>

<div class="repeat-input">
  <div class="sections-container">
    <div class="options-row">
      <section on:click={() => selectPatternType('monthlyTypeI')} on:keydown
        class="pattern-section {$monthlyPointer === 'monthlyTypeI' ? 'active' : ''}"
      >
        <MonthlyInputI 
          on:update={e => updateState('monthlyTypeI', e)} 
        />
      </section>
      
      <section on:click={() => selectPatternType('monthlyTypeII')} on:keydown
        class="pattern-section {$monthlyPointer === 'monthlyTypeII' ? 'active' : ''}"
      >
        <MonthlyInputII 
          on:update={e => updateState('monthlyTypeII', e)} 
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