<script>
  import { setContext } from 'svelte'
  import { activeDragItem, openTaskPopup } from '/src/lib/store'
  import Task from '/src/lib/db/models/Task.js'

  // Allow overriding for demo, default to real implementations
  export let taskService = Task
  export let dragStore = activeDragItem
  export let popupHandler = openTaskPopup

  setContext('taskService', taskService)
  setContext('dragStore', dragStore)
  setContext('popupHandler', popupHandler)
</script>

<slot /> 