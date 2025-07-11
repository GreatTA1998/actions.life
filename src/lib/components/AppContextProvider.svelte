<script>
  import { setContext } from 'svelte'
  import { tasksCache, clickedTaskID, closeTaskPopup, ancestralTree } from '$lib/store'
  import Task from '$lib/db/models/Task.js'
  import Template from '$lib/db/models/Template.js'

  setContext('app', {
    Task, 
    Template,
    tasksCache,
    clickedTaskID,
    closeTaskPopup,
    ancestralTree,
  })
</script>

<slot>

</slot>