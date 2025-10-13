<div 
  onclick={() => openTaskPopup(task)}
  ondragstart={e => startTaskDrag(e, task.id)}
  draggable="true" 
  style="opacity: {task.isDone ? '0.9' : '0.7'};"
>
  <CalCheckableTaskName {task} />
</div>

<script>
  import CalCheckableTaskName from './CalCheckableTaskName.svelte'
  import { getContext } from 'svelte'

  const { openTaskPopup } = getContext('app')
  const { startTaskDrag } = getContext('drag-drop')

  let { task } = $props()
</script> 

<style>
 :root {
   --left-padding: 6px;
 }
</style>