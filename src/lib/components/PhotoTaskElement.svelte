<div onclick={() => openTaskPopup(task)}
  draggable="true" 
  ondragstart={e => startTaskDrag({ e, id: task.id, isFromCal: true })}
  use:lazyCallable={() => hasIntersected = true}
  class={calendarBlock}
  style="
    position: relative;
    display: flex; 
    flex-direction: column;
    min-height: 24px;
    height: {height}px; 
    opacity: {task.isDone ? '0.9' : '0.7'};
    background-color: {isBulletPoint ? '' : 'var(--experimental-black)'};
    background-image: url({hasIntersected ? task.imageDownloadURL : ''});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  "
>
  <div 
    style:background="linear-gradient(rgba(0,0,0,0.7), transparent)"
    style:padding="var(--left-padding)" 
    style:border-radius="var(--left-padding)"
  >
    <CalTaskUnit {task} color="white" />  
  </div>

   <!-- `1vw`: if it's too wide, it overlaps with the task name for short duration tasks -->
   <!-- on:drop preventDefault so that the calendar doesn't think we're scheduling a task -->
   <div draggable="true"
     ondragstart={e => startY = getTrueY(e)}
     ondragend={e => adjustDuration(e, task)}
     style="
       cursor: ns-resize;
       position: absolute;
       left: -3px; 
       bottom: {0}px;
       height: {height/12}px; 
       min-height: 3px;
       width: {isBulletPoint ? '20%' : '100%'}; 
     "
   >
 </div>
</div>

<script>
  import CalTaskUnit from '$lib/components/CalTaskUnit.svelte'
  import { getTrueY } from '$lib/utils/core.js'
  import { lazyCallable } from '$lib/utils/svelteActions.js'
  import { pixelsPerHour } from '/src/routes/[user]/components/Calendar/store.js'
  import { calendarBlock } from '$lib/styles/reused.module.css'
  import { getContext } from 'svelte'

  const { Task, openTaskPopup} = getContext('app')
  const { startTaskDrag } = getContext('drag-drop')

  let { task = null } = $props() // assumes `task` is hydrated

  let startY = $state(0)
  let hasIntersected = $state(false)
  let height = $derived(($pixelsPerHour / 60) * task.duration)
  let isBulletPoint = $derived(height < 24) // 24px is exactly enough to not crop the checkbox and the task name

  function adjustDuration (e, task) {
    const hoursPerPixel = 1 / $pixelsPerHour
    const minutesPerPixel = 60 * hoursPerPixel

    const newY = getTrueY(e)
    const durationChange = minutesPerPixel * (newY - startY)

    Task.update({
      id: task.id,
      keyValueChanges: {
        duration: Math.max(1, task.duration + durationChange) // can't have a 0 duration event
      }      
    })
  }
</script>