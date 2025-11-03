<div>
  <div 
    style="display: flex; align-items: center;" 
    class:accented-branch={node.id === originalPopupTask.id}
  >
    <Checkbox 
      value={node.isDone} 
      onchange={handleCheckboxChange}
      zoom={0.5}
    />

    <div on:click={() => openTaskPopup(node)}
      class:completed-task={node.isDone}
      style="font-size: 0.75rem; cursor: pointer; margin-left: 4px; margin-right: 4px;" class="truncate-to-one-line"
    >
      {node.name}
    </div>
  
    <div on:click={() => isTypingNewSubtask = true} on:keydown class="new-task-icon" style="margin-bottom: 6px;">
      +
    </div>
  </div>

  {#if node.children.length > 0}
    <div style="margin-top: 4px; padding-left: 12px; display: flex; flex-direction: column; row-gap: 4px;">
      {#each node.children as child}
        <RecursiveBulletPoint 
          node={child} 
          {originalPopupTask}
        />
      {/each}
    </div>
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