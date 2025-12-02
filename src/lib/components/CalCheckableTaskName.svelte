<script>
  import Checkbox from '$lib/components/Checkbox.svelte'
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

  <div onclick={() => openTaskPopup(task)} class="cal-task-name truncate-to-one-line unselectable" style="color: {color}">
    {task.name}
  </div>

  {#if parent}
    <div 
      onclick={e => { 
        e.stopPropagation()
        openTaskPopup(parent)
      }} 
      class="glass-pill content-sized" 
      style="color: {color}; white-space: nowrap; overflow: hidden; text-overflow: clip;"
    >
      {parent.name.split(' ')[0]}
    </div>
  {/if}
</div>

<style>
  .glass-pill {
    font-size: 0.75rem;
    background: rgba(120, 120, 120, 0.15);
    border: 1px solid rgba(150, 150, 150, 0.2);
    border-radius: 12px;
    padding: 0px 4px;
    font-weight: 500;
    cursor: pointer;
  }

  .content-sized {
    flex: 0 0 auto;
    max-width: 12ch;
  }
</style>