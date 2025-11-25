<script>
  import TodoList from '../../[user]/components/ListsArea/TodoList.svelte'
  import TaskPopup from '../../[user]/components/TaskPopup/TaskPopup.svelte'
  import { isMobile } from '$lib/utils/core.js'
  import { getContext } from 'svelte'

  const { tasksCache, clickedTaskID, memoryTree } = getContext('app')

  let updateLogTasks = $derived($memoryTree.filter(t => t.name === 'Update Log'))
</script>

<div>
  <TodoList
    isLargeFont={isMobile()}
    listWidth={320}
    trees={updateLogTasks}
  />

  <!-- a flattened popup -->
  {#if $clickedTaskID && $tasksCache[$clickedTaskID]}
    <TaskPopup />
  {/if}
</div>