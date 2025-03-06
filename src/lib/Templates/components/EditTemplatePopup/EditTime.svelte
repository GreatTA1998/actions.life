<script>
  import UXFormField from '$lib/UXFormField.svelte'
  import UXToggleSwitch from '$lib/UXToggleSwitch.svelte'
  import RoundButton from '$lib/Reusable/RoundButton.svelte'
  import { updateTemplate } from '/src/store'
  export let template

  let isEditingSpecificTime = false
  let isEditingDuration = false
  let newDuration = template.duration
  let newStartHHMM = template.startTime
  let displaySpecificTime = !!template.startTime

  function saveDuration() {
    updateTemplate({
      templateID: template.id,
      keyValueChanges: { duration: newDuration },
      oldTemplate: template
    })
  }

  function saveStartTime() {
    updateTemplate({
      templateID: template.id,
      keyValueChanges: { startTime: newStartHHMM },
      oldTemplate: template
    })
    isEditingSpecificTime = false;
  }

  function handleDurationInput(e) {
    isEditingDuration = true
    newDuration = Number(e.detail.value)
  }

  function handleTaskStartInput(e) {
    isEditingSpecificTime = true
    const hhmm = e.detail.value
    newStartHHMM = hhmm
  }

  function isScheduled(taskObj) {
    return taskObj.startDate && taskObj.startTime && taskObj.startYYYY
  }

  function handleSwitchToggle() {
    if (!displaySpecificTime) displaySpecificTime = true
    else {
      updateTemplate({
        templateID: template.id,
        keyValueChanges: { startTime: "" },
        oldTemplate: template
      })
      displaySpecificTime = false
    }
  }
</script>

<div
  style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; row-gap: 24px; margin-top: 24px; font-size: 1.2em;"
>
  <div
    style="display: flex; align-items: center;"
    class:half-invisible={!isScheduled(template)}
  >
    <div style="margin-left: 6px; margin-right: 6px; max-width: 80px;">
      <UXFormField
        pattern={'^[0-9:]*$'}
        fieldLabel="Duration"
        value={Math.round(template.duration)}
        willAutofocus={false}
        on:input={(e) => handleDurationInput(e)}
      >
        <div
          slot="append"
          style="font-weight: 300; color: rgb(60, 60, 60); font-size: 12px;"
        >
          min
        </div>
      </UXFormField>
    </div>

    {#if template.crontab !== ''}
    <div style="margin-top: 0px; margin-left: 16px;">
      <div style="font-size: 14px; rgb(100, 100, 100); margin-bottom: 8px;">
        start time
      </div>
      <div>
        <UXToggleSwitch
          isChecked={displaySpecificTime}
          on:new-checked-state={handleSwitchToggle}
        />
      </div>
      </div>
    {/if}

    {#if displaySpecificTime}
      <div style="max-width: 70px; margin-left: 8px;">
        <UXFormField
          pattern={'^[0-9:]*$'}
          fieldLabel="hh:mm"
          value={template.startTime}
          willAutofocus={true}
          on:input={(e) => handleTaskStartInput(e)}
          placeholder="17:30"
        />
      </div>
    {/if}
  </div>

  {#if isEditingSpecificTime}
    <RoundButton
      on:click={saveStartTime}
      backgroundColor="rgb(0, 89, 125)"
      textColor="white"
    >
      Save changes
    </RoundButton>
  {/if}

  {#if isEditingDuration}
    <RoundButton
      on:click={saveDuration}
      backgroundColor="rgb(0, 89, 125)"
      textColor="white"
    >
      Save changes
    </RoundButton>
  {/if}
</div>
