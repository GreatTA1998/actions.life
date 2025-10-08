<script>
  import Checkbox from '$lib/components/Checkbox.svelte'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')

  let { 
    task = null, 
    color = 'var(--task-name-color)'
  } = $props()
</script>

<div 
  style="width: 100%; display: flex; align-items: center; column-gap: 4px;"
>
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

  <div class="cal-task-name truncate-to-one-line unselectable" style="color: {color}">
    {task.name}
  </div>
</div>