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
      <div style="font-size: {notesFS}; font-weight: 400; color: rgb(20, 20, 20);">
        {task.notes || ''}
      </div>
    </div>
  {/if}
  
  <DurationAdjuster {task} {isBulletPoint} {height} />
</div>

<script>
  // Assumes `task` is hydrated
  import DurationAdjuster from '$lib/components/DurationAdjuster.svelte'
  import SubtaskCountIndicator from '$lib/components/SubtaskCountIndicator.svelte'
  import MslCircle from 'virtual:icons/material-symbols-light/circle'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import { pixelsPerHour } from '/src/routes/[user]/components/Calendar/store.js'
  import { getContext } from 'svelte'
  import { calendarBlock, notesFS } from '$lib/styles/reused.module.css'

  const { openTaskPopup } = getContext('app')
  const { startTaskDrag } = getContext('drag-drop')

  let {
    task = null
  } = $props()

  const iconMinPixelHeight = 32
  let height = $derived(($pixelsPerHour / 60) * task.duration)
  let isBulletPoint = $derived(height < iconMinPixelHeight)
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