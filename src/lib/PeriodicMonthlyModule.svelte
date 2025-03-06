<div style="display: flex; margin-top: 24px; flex-wrap: wrap;">
  {#each Array(27) as _, i}
    <div 
      on:click={() => repeatOnDayOfMonth[i] = !repeatOnDayOfMonth[i]} 
      class="day-of-month-square"
      class:highlighted={repeatOnDayOfMonth[i]}
    >
      {i + 1}
    </div>
  {/each}

  <div 
    on:click={() => willRepeatOnLastDay = !willRepeatOnLastDay} 
    class="day-of-month-square" 
    class:highlighted={willRepeatOnLastDay}
    style="width: fit-content;"
  >
    Last day
  </div>

  {#if isEditingPeriodicity}
    <RoundButton on:click={() => {
      dispatch('new-monthly-schedule', { repeatOnDayOfMonth, willRepeatOnLastDay })
      isEditingPeriodicity = false
    }}
      backgroundColor="rgb(0, 89, 125)" textColor="white"
    >
      Save changes
    </RoundButton>
  {/if}

</div>

<script>
  import RoundButton from '$lib/Reusable/RoundButton.svelte'
  import { createEventDispatcher } from 'svelte'

  export let monthlyTemplate

  let repeatOnDayOfMonth = monthlyTemplate.repeatOnDayOfMonth
  const old = [...repeatOnDayOfMonth]
  let willRepeatOnLastDay = monthlyTemplate.willRepeatOnLastDay
  let isEditingPeriodicity = false
  const dispatch = createEventDispatcher()

  $: {
    if (areArraysEqual(repeatOnDayOfMonth, old)  
      && monthlyTemplate.willRepeatOnLastDay === willRepeatOnLastDay
    ) { 
      isEditingPeriodicity = false
    } else {
      isEditingPeriodicity = true
    }
  }

  function areArraysEqual(a1, a2) {
    var i = a1.length;
    while (i--) {
        if (a1[i] !== a2[i]) return false;
    }
    return true
  }
</script>

<style>
  .day-of-month-square {
    width: 24px; 
    height: 24px; 
    border: 1px solid black; 
    margin: 0px;
    
    display: flex;
    justify-content: center;
    align-items: center;

    cursor: pointer;
  }

  .highlighted {
    background-color: orange;
  }
</style>
