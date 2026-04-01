<script>
  import MonthlyInputI from './MonthlyInputI.svelte'
  import MonthlyInputII from './MonthlyInputII.svelte'
  import { getContext } from 'svelte' 

  const inputStates = getContext('inputStates')
  const monthlyPointer = getContext('monthlyPointer')

  function updateState (type, rrStr) {
    inputStates.update(states => ({ ...states, [type]: rrStr }))
  }
</script>

<div class="w-full flex flex-wrap gap-4 justify-center items-start rounded-lg">
  <section onclick={() => monthlyPointer.set('monthlyTypeI')}
    class:active={$monthlyPointer === 'monthlyTypeI'}
    class="pattern-section"
  >
    <MonthlyInputI 
      onChange={rrStr => updateState('monthlyTypeI', rrStr)} 
    />
  </section>
  
  <section onclick={() => monthlyPointer.set('monthlyTypeII')}
    class:active={$monthlyPointer === 'monthlyTypeII'}
    class="pattern-section"
  >
    <MonthlyInputII 
      onChange={rrStr => updateState('monthlyTypeII', rrStr)} 
    />
  </section>
</div>

<style>
  :root {
    --selected: orange;
  }
  
  .pattern-section {
    border-radius: 4px;
    border: 2px solid rgb(238, 238, 238);
    cursor: pointer;
    opacity: 0.4;
  }
  
  .active {
    border: 2px solid var(--active);
    opacity: 1;
  }
</style>