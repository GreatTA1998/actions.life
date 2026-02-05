<div 
  ondragstart={e => startTaskDrag({ e, id: task.id, isFromCal: true })}
  draggable="true" 
  style="opacity: {task.isDone ? '0.9' : '0.7'};"
>
  <CalTaskUnit {task} />
</div>

<script>
  import CalTaskUnit from './CalTaskUnit.svelte'
  import { getContext } from 'svelte'

  const { startTaskDrag } = getContext('drag-drop')

  let { task } = $props()
</script> 

<style>
 :root {
   --left-padding: 6px;
 }
</style>