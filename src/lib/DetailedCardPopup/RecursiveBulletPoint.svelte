<div 
  style="margin-bottom: 2px; font-size: 12px;"
>
  <div 
    style="display: flex; align-items: center;" 
    class:accented-branch={taskObject.id === originalPopupTask.id}
  >
    <Checkbox 
      value={taskObject.isDone} 
      on:change={(e) => handleCheckboxChange(e)}
      zoom={0.5}
    />
    
    <!-- Yes, to-do list task nodes already have `rootAncestor` properties.
      BUT once we open the popup <RecursiveBulletPoint/> is rendered on the `rootAncestor` tree, whose nodes
      DO NOT have `rootAncestor` (see picture in OneNote)
    -->
    <div 
      on:click={() => openDetailedCard(taskObject)} on:keydown
      class:completed-task={taskObject.isDone}
      style="cursor: pointer; margin-left: 4px; margin-right: 4px;" class="truncate-to-one-line"
    >
      {taskObject.name}
    </div>
  
    <div on:click={() => isTypingNewSubtask = true} on:keydown class="new-task-icon" style="margin-bottom: 6px;">
      +
    </div>
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
          taskObject={child} {originalPopupTask}
        />
      </div>
    {/each}
  {/if}

  {#if isTypingNewSubtask}
    <FormField
      fieldLabel="Task Name"
      value={newSubtaskStringValue}
      on:input={(e) => newSubtaskStringValue = e.detail.value}
      on:focus-out={() => {
        if (newSubtaskStringValue === '') {
          isTypingNewSubtask = false
        }
      }}
      on:task-entered={(e) => onEnter(e)}
    />
  {/if}
</div>

<script>
  import RecursiveBulletPoint from './RecursiveBulletPoint.svelte'
  import Checkbox from '$lib/Reusable/Checkbox.svelte'
  import { openDetailedCard } from '/src/store/detailedCardStore.js'
  import { createTaskNode,updateTaskNode } from '/src/helpers/crud.js'
  import FormField from '$lib/Reusable/FormField.svelte'
  import { getRandomID } from '/src/helpers/utils.js'

  export let taskObject 
  export let originalPopupTask

  let newSubtaskStringValue = ''
  let isTypingNewSubtask = false

  // copied from <RecursiveTask/>
  function handleCheckboxChange (e) {
    // mostRecentlyCompletedTaskID.set(taskObj.id)

    updateTaskNode({
      id: taskObject.id,
      keyValueChanges: { isDone: e.target.checked }
    })
  }

  function onEnter (e) {
    if (newSubtaskStringValue === '') {
      isTypingNewSubtask = false
    }
    else {
      createSubtask(newSubtaskStringValue)
      newSubtaskStringValue = ''
    } 
  }

  function createSubtask (name) {
    createTaskNode({
      id: getRandomID(),
      newTaskObj: {
        name,
        parentID: taskObject.id, 
        listID: taskObject.listID,
        // Inherit parent's childrenLayout by default, can be changed later
        childrenLayout: taskObject.childrenLayout || 'normal'
      }
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