<script>
  import MinimalisticInput from './MinimalisticInput.svelte'
  import MyTimePicker from './MyTimePicker.svelte'
  import MyJSDatePicker from '$lib/components/MyJSDatePicker.svelte'
  import Task from '$lib/db/models/Task.js'
  import { DateTime } from 'luxon'

  export let taskObject

  let newStartMMDD = getLegacyMMDD(taskObject.startDateISO) 
  let newStartYYYY = taskObject.startDateISO ? taskObject.startDateISO.split('-')[0] : ''

  let internalStartTime = taskObject.startTime

  function getLegacyMMDD (simpleISO) {
    if (!simpleISO) return 
    else {
      const [yyyy, MM, dd] = simpleISO.split('-')
      return MM + '/' + dd
    }
  }

  function isScheduled (taskObj) {
    return taskObj.startDate && taskObj.startTime && taskObj.startYYYY;
  }

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

<div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; row-gap: 24px; font-size: 1.2em;">
  <div
    style="display: flex; align-items: start; gap: 16px;"
    class:half-invisible={!isScheduled(taskObject)}
  >
    <div style="display: flex; column-gap: 2px;">
      <MyJSDatePicker
        MMDD={newStartMMDD}
        YYYY={newStartYYYY}
        on:date-selected={e => { 
          newStartMMDD = e.detail.selectedDate
          newStartYYYY = e.detail.selectedYear
          
          const isoMMDD = newStartMMDD.replace('/', '-')
          const YYYYMMDD = `${newStartYYYY}-${isoMMDD}`

          handleChanges('startDateISO', YYYYMMDD)
        }}
      />

      <MyTimePicker
        placeholder="hh:mm"
        pattern="[0-9]{2}:[0-9]{2}"
        value={internalStartTime}
        on:input={(e) => handleChanges("startTime", e.detail.typedHHMM)}
        on:time-selected={(e) => {
          internalStartTime = e.detail.selectedHHMM; // seems like a bug here,
          handleChanges("startTime", e.detail.selectedHHMM);
        }}
      />
    </div>

    <MinimalisticInput
      value={Math.round(taskObject.duration)}
      on:input={e => handleChanges("duration", Number(e.target.value))}
    />
  </div>
</div>