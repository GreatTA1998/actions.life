<div 
  onclick={() => openTaskPopup(task)}
  ondragstart={e => startTaskDrag({ e, id: task.id, isFromCal: true })} draggable="true" 
  class:clear-border={!isBulletPoint}
  class:graph-paper-texture={!isBulletPoint}
  class={!isBulletPoint ? calendarBlock : ''}

  style="
    --image-download-url: url({task.imageDownloadURL});
    position: relative;
    height: {height}px; 
    min-height: {iconMinPixelHeight}px;
    opacity: {task.isDone ? '0.9' : '0.7'};
    background-color: {isBulletPoint ? '' : 'var(--navbar-bg-color)'};
    padding-left: {isBulletPoint ? '0px' : 'var(--left-padding)'};
    padding-right: var(--left-padding);
    display: flex; 
    flex-direction: column;
    row-gap: 4px;
  "
>
  <!-- As long as this parent div is correctly sized, the duration adjusting area 
   will be positioned correctly (it's glued to the bottom of this parent div)

   `min-height` prevents the parent from being super small when it's bullet point mode
  -->
  <div class="flex items-center w-full gap-1">
    {#if isBulletPoint}
      <div 
        class="flex items-center"
        style:margin-right="calc(var(--left-padding) - 2px)" 
        style:color={task.isDone ? 'rgb(20, 20, 20)' : '#509c13'}
      >
        <MslCircle style="font-size: 2px;"/>
      </div>
    {/if}

    <DoodleIcon iconTask={task} />

    {#if task.children.length > 0}
      <SubtaskCountIndicator {task} />
    {/if}
  </div>

  {#if !isBulletPoint}
    <div style="flex-grow: 1; overflow: hidden;">
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
  import SubtaskCountIndicator from '$lib/components/SubtaskCountIndicator.svelte'
  import MslCircle from 'virtual:icons/material-symbols-light/circle'
  import { getTrueY } from '$lib/utils/core.js'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import { pixelsPerHour } from '/src/routes/[user]/components/Calendar/store.js'
  import { getContext } from 'svelte'
  import { calendarBlock } from '$lib/styles/reused.module.css'

  const { Task,openTaskPopup } = getContext('app')
  const { startTaskDrag } = getContext('drag-drop')
  const iconMinPixelHeight = 32

  let {
    task = null
  } = $props()

  let height = $derived(($pixelsPerHour / 60) * task.duration)
  let isBulletPoint = $derived(height < iconMinPixelHeight)
  let startY = 0

  function startAdjustingDuration (e) {
    startY = getTrueY(e)
  }

  function adjustDuration (e, task) {
    if (!task.duration) { // quickfix
      task.duration = 10
    }

    const hoursPerPixel = 1 / $pixelsPerHour
    const minutesPerPixel = 60 * hoursPerPixel

    const newY = getTrueY(e)
    const durationChange = minutesPerPixel * (newY - startY)

    Task.update({
      id: task.id,
      kvChanges: {
        duration: Math.max(1, task.duration + durationChange) // can't have a 0 duration event
      }      
    })
  }
</script> 

<style>
  .clear-border {
    border: 1px solid var(--experimental-black);
  }

  .graph-paper-texture {
      background-image: 
        linear-gradient(90deg, rgba(200,200,200,0.8) 1px, transparent 0), 
        linear-gradient(180deg, rgba(200,200,200,0.8) 1px, transparent 0);
      background-size: 24px 24px; /* Adjust the size of the pattern */
  }
</style>