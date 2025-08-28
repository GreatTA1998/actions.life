<div 
  onclick={() => openTaskPopup(task)}
  ondragstart={e => startTaskDrag(e, task.id, { draggedItem })} draggable="true" 
  class:calendar-block={!isBulletPoint}
  class:clear-border={!isBulletPoint}
  class:graph-paper-texture={!isBulletPoint && !task.imageDownloadURL}
  class:full-photo-texture={!isBulletPoint && task.imageDownloadURL}

  style="
    --image-download-url: url({task.imageDownloadURL});
    position: relative;
    height: {height}px; 
    min-height: {iconMinPixelHeight}px;
    font-size: {fontSize}rem;
    opacity: {task.isDone ? '0.9' : '0.7'};
    background-color: {isBulletPoint ? '' : '#f8f8f2;'};
    padding-left: {isBulletPoint ? '0px' : 'var(--left-padding)'};
    padding-right: var(--left-padding);
    display: flex; 
    flex-direction: column;
  "
>
 <!-- As long as this parent div is correctly sized, the duration adjusting area 
   will be positioned correctly (it's glued to the bottom of this parent div)

   `min-height` prevents the parent from being super small when it's bullet point mode
 -->
 <div style="display: flex; align-items: center; width: 100%;">
   {#if isBulletPoint}
     <span class="material-icons" 
       style="
         font-size: 2px; 
         margin-right: calc(var(--left-padding) - 2px);
         color: {task.isDone ? 'rgb(20, 20, 20)' : '#509c13'}; 
       "
     >
       circle
     </span>
   {/if}

  <div>
    <!-- Description is on the same line (so the place of the title),
    but retains its own font to differentiate it from the title -->
  </div>

  <DoodleIcon iconTask={task} />
 </div>
 <!-- End of task name flexbox -->

  {#if !isBulletPoint && !task.imageDownloadURL}
  <!-- copied from TaskElement.svelte -->
    {#if task.children.length > 0}
      <div style="margin-top: 6px; display: flex; align-items: center; column-gap: 2px; color: rgb(40, 40, 40);">
        <span class="material-symbols-outlined" style="font-size: 16px;">check_circle</span>
        <span class="font-weight: 200;">
          {task.children.filter(child => child.isDone).length}/{task.children.length}
        </span>
      </div> 
    {/if}

    <div style="flex-grow: 1; overflow: hidden; margin-left: 4px;">
      <div style="font-size: 12px; font-weight: 400; color: rgb(20, 20, 20);">
        {task.notes || ''}
      </div>
    </div>
  {/if}

   <!-- 
     `1vw`: if it's too wide, it overlaps with the task name for short duration tasks 
   -->
   <!-- on:drop preventDefault so that the calendar doesn't think we're scheduling a task -->
   <div draggable="true"
     ondragstart={e => startAdjustingDuration(e)}
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
  // Assumes `task` is hydrated
  import { startTaskDrag } from '$lib/utils/dragDrop.js'
  import { getTrueY } from '$lib/utils/core.js'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import { pixelsPerHour } from '/src/routes/[user]/components/Calendar/store.js'
  import { getContext } from 'svelte'

  const { Task,openTaskPopup, draggedItem } = getContext('app')
  const iconMinPixelHeight = 32

  export let task = null
  export let fontSize = 1

  let startY = 0

  $: height = ($pixelsPerHour / 60) * task.duration
  $: isBulletPoint = height < iconMinPixelHeight

  function startAdjustingDuration (e) {
    startY = getTrueY(e)
  }

  function adjustDuration (e, task) {
    // quickfix
    if (!task.duration) {
      task.duration = 10
    }

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

<style>
  :root {
    --left-padding: 6px;
    --default-task-color: hsla(210, 20%, 36%, 0.6);

    --experimental-black: hsla(0, 100%, 0%, 0.6);
    --experimental-purple: hsla(248, 53%, 58%, 0.6);
    --experimental-red: hsla(0, 100%, 50%, 0.6);
  }

  .calendar-block {
    width: 100%;
    cursor: pointer;
    border-radius: var(--left-padding);
  }

  .clear-border {
    border: 1px solid var(--experimental-black);
  }

  .graph-paper-texture {
      background-image: 
        linear-gradient(90deg, rgba(200,200,200,0.8) 1px, transparent 0), 
        linear-gradient(180deg, rgba(200,200,200,0.8) 1px, transparent 0);
      background-size: 24px 24px; /* Adjust the size of the pattern */
  }

  .full-photo-texture {
    background-image: var(--image-download-url);
    background-size: contain;
    background-repeat: no-repeat;
  }
</style>