<script>
  import MinimalisticInput from '$lib/components/MinimalisticInput.svelte'
  import MyTimePicker from '$lib/components/MyTimePicker.svelte'
  import MyJSDatePicker from '$lib/components/MyJSDatePicker.svelte'
  import { DateTime } from 'luxon'
  import { getContext } from 'svelte'

  const { Task, willOpenDatePicker } = getContext('app')

  export let taskObject

  function handleChanges (key, value, timeZone) {
    if (typeof Number(value) !== "number") return

    const taskUpdates = {
      [key]: value
    }

    if (timeZone) taskUpdates.timeZone = DateTime.local().zoneName

    Task.update({
      id: taskObject.id,
      keyValueChanges: taskUpdates
    })
  }
</script>

<div style="display: flex; align-items: start; gap: 16px; font-size: 1.2em;">
  <div style="display: flex; column-gap: 2px;">
    <!-- quickfix, if it changes on every `taskObject` without id, the datepicker's node attachments would break for some reason -->
    {#key taskObject.id}
      <MyJSDatePicker
        startDateISO={taskObject.startDateISO}
        willOpen={$willOpenDatePicker}
        on:date-selected={e => { 
          const { mmdd, yyyy } = e.detail
          if (!(mmdd && yyyy)) handleChanges('startDateISO', '')
          else handleChanges('startDateISO', `${yyyy}-${mmdd.replace('/', '-')}`)
        }}
      />
    {/key}

    <MyTimePicker value={taskObject.startTime}
      on:input={e => handleChanges('startTime', e.detail.typedHHMM)}
      on:time-selected={e => handleChanges('startTime', e.detail.selectedHHMM)}
    />
  </div>

  <MinimalisticInput value={Math.round(taskObject.duration)}
    on:input={e => handleChanges('duration', Number(e.target.value))}
  />
</div>