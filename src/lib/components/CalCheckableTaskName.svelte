<script>
  import Checkbox from '$lib/components/Checkbox.svelte'
  import ParentBadge from '$lib/components/ParentBadge.svelte'
  import SubtaskCountIndicator from '$lib/components/SubtaskCountIndicator.svelte'
  import { getContext } from 'svelte'

  const { Task, tasksCache, openTaskPopup } = getContext('app')

  let { 
    task = null, 
    color = 'var(--task-name-color)'
  } = $props()

  let parent = $derived(task.parentID ? $tasksCache[task.parentID] : null)
</script>

<div class="flexbox items-center gap-x-1 w-full">
  <div style:flex-shrink="0">
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

  <div 
    style:flex-grow="0" style:color={color}
    class="task-name truncate select-none" 
    onclick={() => openTaskPopup(task)} 
  >
    {task.name}
  </div>

  {#if task.children.length > 0}
    <SubtaskCountIndicator {task} {color} />
  {/if}

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