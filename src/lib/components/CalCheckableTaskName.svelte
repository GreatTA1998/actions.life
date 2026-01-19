<script>
  import Checkbox from '$lib/components/Checkbox.svelte'
  import ParentBadge from '$lib/components/ParentBadge.svelte'
  import { getContext } from 'svelte'

  const { Task, tasksCache, openTaskPopup } = getContext('app')

  let { 
    task = null, 
    color = 'var(--task-name-color)'
  } = $props()

  let parent = $derived(task.parentID ? $tasksCache[task.parentID] : null)
</script>

<div style="width: 100%; display: flex; align-items: center; column-gap: 4px;">
  <div>
    <Checkbox
      value={task.isDone}
      onchange={e => Task.update({
        id: task.id,
        keyValueChanges: {
          isDone: e.target.checked
        }
      })}
    />
  </div>

  <div onclick={() => openTaskPopup(task)} class="task-name truncate-to-one-line unselectable" style="color: {color}">
    {task.name}
  </div>

  {#if parent}
    <ParentBadge {parent} --color={color} />
  {/if}
</div>

<style>
  .task-name {
    font-weight: 500;
    font-size: 0.8rem;
    cursor: pointer; 
  }
</style>