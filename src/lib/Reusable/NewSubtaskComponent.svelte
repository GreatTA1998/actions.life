{#if !isCreatingSubtask}
  <div on:click={() => isCreatingSubtask = true} class="new-task-icon" style="margin-bottom: 6px;">
    +
  </div>
{:else}
  <FormField
    fieldLabel="Milestone"
    value={newSubtaskName}
    on:input={(e) => {
      newSubtaskName = e.detail.value;
    }}
    on:focus-out={() => {
      if (newSubtaskName === '') {
        isCreatingSubtask = false
      }
    }}
    on:task-entered={(e) => createNewSubtaskMilestone(e)}
  />
{/if}

<script>
  import FormField from '$lib/Reusable/FormField.svelte'
  import {
    getRandomID,
    getDateInDDMMYYYY,
    getTimeInHHMM
  } from '/src/helpers/utils.js'
  import { createEventDispatcher } from 'svelte'

  export let parentID

  let isCreatingSubtask = false
  let newSubtaskName = ''
  const dispatch = createEventDispatcher()

  function createNewSubtaskMilestone (e) {
    if (newSubtaskName === '') {
      isCreatingSubtask = false 
    }
    else {
      const newTaskID = getRandomID()
      const subtaskObj = {
        id: newTaskID,
        parentID,
        name: newSubtaskName,
        duration: 60
      }

      const d = new Date()
      d.setMonth(d.getMonth() + 1)
      subtaskObj.deadlineDate = getDateInDDMMYYYY(d)
      subtaskObj.deadlineTime = getTimeInHHMM({ dateClassObj: d })

      dispatch('subtask-create', {
        id: newTaskID,
        parentID,
        newTaskObj: subtaskObj
      })

      newSubtaskName = ''
      isCreatingSubtask = false
    }
  }
</script>