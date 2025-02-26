<div 
  style="margin-bottom: 2px; font-size: 12px;"
>
  <div 
    style="display: flex; align-items: center;" 
    class:accented-branch={taskObject.id === originalPopupTask.id}
  >
    <ReusableCheckbox 
      value={taskObject.isDone} 
      on:change={(e) => handleCheckboxChange(e)}
      zoom={0.5}
    />
    
    <!-- Yes, to-do list task nodes already have `rootAncestor` properties.
      BUT once we open the popup <RecursiveBulletPoint/> is rendered on the `rootAncestor` tree, whose nodes
      DO NOT have `rootAncestor` (see picture in OneNote)
    -->
    <div 
      on:click={() => {
        dispatch('task-click', { task: taskObject })
      }}
      class:completed-task={taskObject.isDone}
      style="cursor: pointer; margin-left: 4px; margin-right: 4px;" class="truncate-to-one-line"
    >
      {taskObject.name}
    </div>
    
    {#if taskObject.startDate && taskObject.startTime}
      ({taskObject.startDate} {taskObject.startTime})
    {/if}
  </div>

  {#if taskObject.daysBeforeRepeating}
    (repeats every {taskObject.daysBeforeRepeating} days)
    (completed {taskObject.completionCount || 0} times)
    (missed {taskObject.missedCount || 0} times)
  {/if}

  <!-- quickfix, as this'll be re-worked soon -->
  {#if taskObject.children}
    {#each taskObject.children as child}
      <div style="margin-left: 12px;">
        <RecursiveBulletPoint 
          on:task-click
          on:task-checkbox-change
          taskObject={child} {originalPopupTask}
        />
      </div>
    {/each}
  {/if}
</div>

<script>
  import RecursiveBulletPoint from './RecursiveBulletPoint.svelte'
  import ReusableCheckbox from '$lib/ReusableCheckbox.svelte'
  import { createEventDispatcher } from 'svelte'
  import { mostRecentlyCompletedTaskID } from '/src/store'

  export let taskObject 
  export let originalPopupTask

  const dispatch = createEventDispatcher()

  // copied from <RecursiveTask/>
  function handleCheckboxChange (e) {
    // mostRecentlyCompletedTaskID.set(taskObj.id)

    dispatch('task-checkbox-change', {
      id: taskObject.id,
      isDone: e.target.checked
    })
  }
</script>

<style>
  .completed-task {
    text-decoration: line-through;
    color: rgb(180, 180, 180);
  }

  .accented-branch {
    color: var(--logo-twig-color);
    font-weight: 600;
  }
</style>