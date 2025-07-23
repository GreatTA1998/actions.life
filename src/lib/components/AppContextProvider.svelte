<script>
  import { setContext } from 'svelte'
  import { tasksCache, clickedTaskID, closeTaskPopup, ancestralTree, openTaskPopup, activeDragItem, grabOffset, user, willOpenDatePicker } from '$lib/store'
  import Task from '$lib/db/models/Task.js'
  import Template from '$lib/db/models/Template.js'

  setContext('app', {
    user,
    Task, 
    Template,
    tasksCache,
    clickedTaskID,
    ancestralTree,
    openTaskPopup,
    willOpenDatePicker,
    closeTaskPopup,
    activeDragItem,
    grabOffset
  })
</script>

<slot>

</slot>