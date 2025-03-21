<script>
  import RoundButton from '$lib/components/RoundButton.svelte'
  import { updateCrontab } from '/src/routes/[user]/components/Templates/utils.js'
  export let template
  export let crontabIndex = 3
  export let maxDays = 7

  let oldSelectedDays = template.crontab.split(' ')[crontabIndex].split(',')
  let dayOfWeekSymbol = [ "Sun", 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  let selectedDays = template.crontab.split(' ')[crontabIndex].split(',')
  let isEditingPeriodicity = false

function handleSave() {
  updateCrontab({selectedDays, template, crontabIndex})
  isEditingPeriodicity = false
}

  function handleSelectDay(i) {
    if (selectedDays.includes(i)) {
      selectedDays = selectedDays.filter((day) => day !== i)
      if(selectedDays.length === 0) selectedDays = ['0']
    } else {
      selectedDays = [...selectedDays, i]
    }
  }

  $: {
    isEditingPeriodicity = oldSelectedDays.join(',') !== selectedDays.join(',')
  }
</script>

<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
  <div style="display: flex; max-width: 100%; flex-wrap: wrap;">
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
  /* .underlined-input {
    border: none;
    border-bottom: 2px solid #313131;
    outline: none;
    padding: 4px;
    padding-bottom: 4px;
    font-size: 16px;
    width: 20px;
    margin: 4px;
    font-weight: 500;
  } */

  .circle {
    width: 30px;
    height: 30px;
    line-height: 30px;
    border-radius: 50%;
    font-size: 12px;
    text-align: center;

    /* extra */
    margin-right: 8px;
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
