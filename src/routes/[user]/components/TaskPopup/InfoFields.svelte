<script>
  import DurationPicker from '$lib/components/DurationPicker.svelte'
  import MyTimePicker from '$lib/components/MyTimePicker.svelte'
  import FieldWithDatePicker from '$lib/components/FieldWithDatePicker.svelte'
  import ColorTags from './ColorTags.svelte'
  import { DateTime } from 'luxon'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')

  let { task } = $props()

  function handleChanges (key, value, timeZone) {
    if (typeof Number(value) !== "number") return

    const taskUpdates = {
      [key]: value
    }

    if (timeZone) taskUpdates.timeZone = DateTime.local().zoneName

    Task.update({
      id: task.id,
      kvChanges: taskUpdates
    })
  }
</script>

<div class="flex items-center gap-x-6" style="font-size: 1.25rem;">
  {#key task.id}
    <FieldWithDatePicker
      startDateISO={task.startDateISO}
      onChange={yyyyMMdd => handleChanges('startDateISO', yyyyMMdd)}
    />
  {/key}

  <MyTimePicker value={task.startTime}
    onTimeSelected={hhmm => handleChanges('startTime', hhmm)}
  />

  <DurationPicker value={Math.round(task.duration)}
    oninput={e => handleChanges('duration', Number(e.target.value))}
  />

  <ColorTags {task} />
</div>