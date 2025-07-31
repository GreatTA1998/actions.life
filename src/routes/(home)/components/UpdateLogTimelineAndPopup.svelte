<script>
  import RecursiveTask from '../../[user]/components/TaskTree/RecursiveTask.svelte'
  import { getContext } from 'svelte'
  import TaskPopup from '../../[user]/components/TaskPopup/TaskPopup.svelte'

  const { tasksCache, clickedTaskID, memoryTree } = getContext('app')

  $: updateLogTasks = $memoryTree.filter(t => t.name === 'Update Log')
</script>

<div style="background-color: white; padding: 16px 8px; border-radius: 16px;">
  {#each updateLogTasks as taskObj (taskObj.id)}
    <RecursiveTask
      {taskObj}
      depth={0}
      ancestorRoomIDs={[]}
      isLargeFont={false}
    />
  {/each}


  <!-- a flattened popup -->
  {#if $clickedTaskID && $tasksCache[$clickedTaskID]}
    <TaskPopup />
  {/if}
</div>