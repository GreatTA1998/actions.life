<script>
  import RoundButton from '$lib/components/RoundButton.svelte'
  import { updateCrontab } from '/src/routes/[user]/components/Templates/utils.js'

  export let template

  // function validateAndSaveYearlyDate() {
  //   const dateRegex = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/
  //   if (dateRegex.test(yearlyDate)) {
  //     const [month, day] = yearlyDate.split('-')
  //     const crontab = `0 0 ${day} ${month} *`
  //     updateTemplate({ templateID: template.id, keyValueChanges: { crontab: crontab }, oldTemplate: template })
  //   } else {
  //     alert('Please enter a valid date in MM-DD format')
  //   }
  // }

  // <input
  //   type="text"
  //   bind:value={yearlyDate}
  //   placeholder="MM-DD"
  //   pattern="^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$"
  //   title="Please enter a date in MM-DD format"
  // />

  const monthAbbrev = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

  let oldSelectedMonths = template.crontab.split(' ')[3].split(',')
  let selectedMonths = template.crontab.split(' ')[3].split(',')
  let isEditingPeriodicity = false

  function handleSave() {
    updateCrontab({selectedDays: selectedMonths, template, crontabIndex: 3})
    isEditingPeriodicity = false
  }

  function handleSelectMonth(i) {
    if (selectedMonths.includes(i)) {
      selectedMonths = selectedMonths.filter((month) => month !== i)
      if(selectedMonths.length === 0) selectedMonths = ['1']
    } else {
      selectedMonths = [...selectedMonths, i]
    }
  }

  $: {
    isEditingPeriodicity = oldSelectedMonths.join(',') !== selectedMonths.join(',')
  }
</script>

<div style="display: flex; align-items: center; gap: 4px; flex-wrap: wrap;">
  <div class="month-grid">
    {#each monthAbbrev as month, i}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        on:click={() => handleSelectMonth(String(i + 1))}
        class="month-pill"
        class:not-selected={!selectedMonths.includes(String(i + 1))}
        class:highlighted={selectedMonths.includes(String(i + 1))}
      >
        {selectedMonths.includes(String(i + 1)) ? month : ''}
      </div>
    {/each}
  </div>

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
  .month-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
    width: fit-content;
  }

  .month-pill {
    width: 36px;
    height: 24px;
    border-radius: 12px;
    font-size: 10px;
    text-align: center;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
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