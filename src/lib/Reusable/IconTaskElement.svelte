<!-- 
  Note, the HTML checkbox tick color literally cannot be changed, but it will be automatically white if it "decides" that our chosen background color is dark enough, 
  or vice versa
 -->

<div 
  on:click={() => openDetailedCard(task)}
  on:dragstart|self={(e) => startDragMove(e, task.id)} 
  draggable="true" 
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
  on:keydown={() => {}}
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

    <DoodleIcon
      iconTask={task}
      on:task-click
      on:task-update
    />

    {#if isBulletPoint}
      <!-- <div style="flex-grow: 1; overflow: hidden;">
        <div class="truncate-to-one-line" 
          style="font-size: 12px; font-weight: 400; color: {isBulletPoint ? 'rgb(0,0,0)' : 'rgb(0,0,0)'};">
          {task.notes || ''}
        </div>
      </div> -->
    {/if}

 </div>
 <!-- End of task name flexbox -->

  {#if !isBulletPoint && !task.imageDownloadURL}
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
     on:dragstart={(e) => startAdjustingDuration(e)}
     on:dragend={(e) => adjustDuration(e, task)}
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
  import { createEventDispatcher } from 'svelte'
  import { getTrueY } from '/src/helpers/everythingElse.js'
  import { grabOffset, activeDragItem, openDetailedCard } from '/src/store'
  import DoodleIcon from '$lib/Reusable/DoodleIcon.svelte'
  import { pixelsPerHour } from '/src/store/calendarStore.js'

  export let task = null

  export let fontSize = 1

  const iconMinPixelHeight = 32

  $: height = ($pixelsPerHour / 60) * task.duration
  $: isBulletPoint = height < iconMinPixelHeight

  const dispatch = createEventDispatcher()
  let startY = 0

  function startDragMove (e, id) {
    e.dataTransfer.setData("text/plain", id)

    // record distance from the top of the element
    const rect = e.target.getBoundingClientRect()
    const y = e.clientY - rect.top // y position within el ement

    activeDragItem.set({
      kind: 'room',
      ...task
    })

    grabOffset.set(y)
  }

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

    dispatch('task-update', {
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