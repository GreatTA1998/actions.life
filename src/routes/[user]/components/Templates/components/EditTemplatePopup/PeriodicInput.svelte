<script>
  import Template from '/src/lib/db/models/Template/index.js'
  import RoundButton from '$lib/components/RoundButton.svelte'
  import { user } from '/src/lib/store'
  export let template
  export let crontabIndex = 3
  export let maxDays = 7

  let oldSelectedDays = template.crontab.split(' ')[crontabIndex].split(',')
  let dayOfWeekSymbol = [ "Sun", 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  let selectedDays = [] // template.crontab.split(' ')[crontabIndex].split(',')
  let isEditingPeriodicity = false

  $: {
    isEditingPeriodicity = oldSelectedDays.join(',') !== selectedDays.join(',')
  }

  function handleSave() {
    console.log('selectedDays =', selectedDays) // ['0', '5', '7', '3']
    const rrStr = convertArrayToRRule(selectedDays)
    console.log(`rrStr = ${rrStr}`)
    Template.update({ userID: $user.uid, id: template.id, updates: { rrStr } })
    isEditingPeriodicity = false
  }

  function convertArrayToRRule(selectedDays) {
    // Map from array indices to RRule day abbreviations
    // ISO 8601 standard which uses 1-7 for Monday-Sunday
    const dayMap = {
      1: 'MO',
      2: 'TU',
      3: 'WE',
      4: 'TH',
      5: 'FR',
      6: 'SA',
      7: 'SU'
    }
      
    // Convert the array numbers to day abbreviations
    const days = selectedDays.map(day => dayMap[day]).join(',')
    
    // Return the RRule string
    return `FREQ=WEEKLY;BYDAY=${days}`
  }

  function handleSelectDay(i) {
    if (selectedDays.includes(i)) {
      selectedDays = selectedDays.filter((day) => day !== i)
    } else {
      selectedDays = [...selectedDays, i]
    }
  }
</script>

<div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
  {#each { length: maxDays } as _, i}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      on:click={() => handleSelectDay(String(i + 1))}
      class="circle"
      class:not-selected={!selectedDays.includes(String(i + 1))}
      class:highlighted={selectedDays.includes(String(i + 1))}
    >
      {maxDays == 7 ? dayOfWeekSymbol[i + 1]: i + 1}
    </div>
  {/each}

  {#if isEditingPeriodicity}
    <RoundButton
      on:click={handleSave}
      backgroundColor="rgb(0, 89, 125)"
      textColor="white"
    >
      Save changes
    </RoundButton>
  {/if}
</div>

<style>
  .circle {
    width: 30px;
    height: 30px;
    line-height: 30px;
    border-radius: 50%;
    font-size: 12px;
    text-align: center;

    /* extra */
    cursor: pointer;
  }

  .not-selected {
    color: rgb(160, 160, 160);
    background-color: rgb(100, 100, 100);
    background: #000;
  }

  .highlighted {
    background-color: orange;
    color: black;
    font-weight: 600;
  }
</style>