<script>
  import { setContext } from 'svelte'
  import { activeDragItem, openTaskPopup } from '/src/lib/store'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')

  // Allow overriding for demo, default to real implementations
  export let taskService = Task
  export let dragStore = activeDragItem
  export let popupHandler = openTaskPopup

  setContext('taskService', taskService)
  setContext('dragStore', dragStore)
  setContext('popupHandler', popupHandler)
</script>

<slot /> 