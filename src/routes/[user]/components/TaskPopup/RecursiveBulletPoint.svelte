<div style="margin-bottom: 2px; font-size: 12px;">
  <div 
    style="display: flex; align-items: center;" 
    class:accented-branch={node.id === originalPopupTask.id}
  >
    <Checkbox 
      value={node.isDone} 
      onchange={handleCheckboxChange}
      zoom={0.5}
    />
    
    <!-- Yes, to-do list task nodes already have `rootAncestor` properties.
      BUT once we open the popup <RecursiveBulletPoint/> is rendered on the `rootAncestor` tree, whose nodes
      DO NOT have `rootAncestor` (see picture in OneNote)
    -->
    <div on:click={() => openTaskPopup(node)} on:keydown
      class:completed-task={node.isDone}
      style="cursor: pointer; margin-left: 4px; margin-right: 4px;" class="truncate-to-one-line"
    >
      {node.name}
    </div>
  
    <div on:click={() => isTypingNewSubtask = true} on:keydown class="new-task-icon" style="margin-bottom: 6px;">
      +
    </div>
  </div>

  {#if node.daysBeforeRepeating}
    (repeats every {node.daysBeforeRepeating} days)
    (completed {node.completionCount || 0} times)
    (missed {node.missedCount || 0} times)
  {/if}

  {#each node.children as child}
    <div style="margin-left: 12px;">
      <RecursiveBulletPoint 
        node={child} 
        {originalPopupTask}
      />
    </div>
  {/each}
  
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
  import Checkbox from '$lib/components/Checkbox.svelte'
  import FormField from '$lib/components/FormField.svelte'
  import { openTaskPopup } from '/src/lib/store'
  import { getRandomID } from '/src/lib/utils/core.js'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')

  export let node 
  export let originalPopupTask

  let newSubtaskStringValue = ''
  let isTypingNewSubtask = false

  function handleCheckboxChange (e) {
    Task.update({
      id: node.id,
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
    Task.create({
      id: getRandomID(),
      newTaskObj: {
        name,
        parentID: node.id, 
        childrenLayout: node.childrenLayout || 'normal'
      }
    })
  }
</script>

<style>
  .completed-task {
    text-decoration: line-through;
    opacity: 0.5;
  }

  .accented-branch {
    color: var(--logo-twig-color);
    font-weight: 600;
  }
</style>