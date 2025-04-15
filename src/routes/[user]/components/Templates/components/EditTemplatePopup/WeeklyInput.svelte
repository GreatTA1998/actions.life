<script>
  import Template from '/src/lib/db/models/Template/index.js'
  import RoundButton from '$lib/components/RoundButton.svelte'
  import { user } from '/src/lib/store'

  export let template

  let dayOfWeekSymbol = [ "Sun", 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  
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
  
  const inverseDayMap = {}
  Object.entries(dayMap).forEach(([key, value]) => {
    inverseDayMap[value] = key
  })

  let selectedIndices = template.rrStr ? parseRRuleString(template.rrStr) : []
  let isEditingPeriodicity = false

  $: {
    isEditingPeriodicity = parseRRuleString(template.rrStr).toString() != selectedIndices.toString() // .toString() is necessary for array equality
  }
  
  function parseRRuleString(rrStr) {
    if (!rrStr) return []
    
    const bydayMatch = rrStr.match(/BYDAY=([^;]*)/)
    if (!bydayMatch) return []
    
    const bydayValue = bydayMatch[1]
    return bydayValue.split(',').map(day => inverseDayMap[day]).filter(Boolean)
  }

  function handleSave() {
    console.log('selectedIndices =', selectedIndices) // ['0', '5', '7', '3']
    const rrStr = convertArrayToRRule(selectedIndices)
    console.log(`rrStr = ${rrStr}`)
    Template.update({ userID: $user.uid, id: template.id, updates: { rrStr } })
    isEditingPeriodicity = false
  }

  function convertArrayToRRule(selectedIndices) {
    const days = selectedIndices.map(i => dayMap[i]).join(',')
    return `FREQ=WEEKLY;BYDAY=${days}`
  }

  function handleSelectDay(i) {
    if (selectedIndices.includes(i)) {
      selectedIndices = selectedIndices.filter((day) => day !== i)
    } else {
      selectedIndices = [...selectedIndices, i]
    }
  }
</script>

<div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
  {#each { length: 7 } as _, i}
    <div on:click={() => handleSelectDay(String(i + 1))} on:keydown
      class="circle"
      class:not-selected={!selectedIndices.includes(String(i + 1))}
      class:highlighted={selectedIndices.includes(String(i + 1))}
    >
      {dayOfWeekSymbol[i + 1]}
    </div>
  {/each}

  {#if isEditingPeriodicity}
    <RoundButton on:click={handleSave}
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