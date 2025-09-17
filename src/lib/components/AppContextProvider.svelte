<script>
  import { setContext } from 'svelte'
  import { 
    user,
    tasksCache, 
    clickedTaskID, closeTaskPopup, ancestralTree, openTaskPopup, willOpenDatePicker,
  } from '$lib/store'
  import Task from '$lib/db/models/Task.js'
  import Template from '$lib/db/models/Template.js'

  let { children } = $props()

  setContext('app', {
    user,
    Task, 
    Template,
    tasksCache,
    clickedTaskID,
    ancestralTree,
    openTaskPopup,
    closeTaskPopup,
    willOpenDatePicker
  })
</script>

{@render children()}