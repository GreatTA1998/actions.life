<div 
  onclick={() => openTaskPopup(task)}
  ondragstart={e => startTaskDrag({ e, id: task.id, isFromCal: true })} 
  draggable="true" 
  class="claude-draggable-item"
  class:calendar-block={!isBulletPoint}
  style="
    position: relative;
    height: {height}px; 
    min-height: 12px;
    font-size: {fontSize}rem;
    opacity: {task.isDone ? '0.9' : '0.7'};
    background-color: {isBulletPoint ? '' : 'var(--experimental-black)'};
    background-image: {task.imageDownloadURL ? `url(${task.imageDownloadURL})` : ''};
    background-size: contain;
    background-repeat: no-repeat;
    padding-left: {isBulletPoint ? '0px' : 'var(--left-padding)'};
    padding-right: var(--left-padding);
    display: flex; flex-direction: column; row-gap: 4px;
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
          color: {task.isDone ? '#509c13' : 'rgb(20, 20, 20)'}; 
        "
      >
        circle
      </span>
    {/if}

    <CalCheckableTaskName 
      {task} 
      color={isBulletPoint ? 'black' : 'white'}
    />
  </div>
  <!-- End of task name flexbox -->

  {#if !isBulletPoint}
    {#if task.children.length > 0}
      <SubtaskCountIndicator taskObj={task} color='white' />
    {/if}

    <div style="flex-grow: 1; overflow: hidden;">
      <div style="font-size: 12px; font-weight: 300; color: {isBulletPoint ? '' : 'white'};">
        {task.notes || ''}
      </div>
    </div>
  {/if}

    <!-- 
      `1vw`: if it's too wide, it overlaps with the task name for short duration tasks 
    -->
    <!-- on:drop preventDefault so that the calendar doesn't think we're scheduling a task -->
    <div draggable="true"
      ondragstart={(e) => startAdjustingDuration(e)}
      ondragend={(e) => adjustDuration(e, task)}
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
  import CalCheckableTaskName from '$lib/components/CalCheckableTaskName.svelte'
  import SubtaskCountIndicator from '$lib/components/SubtaskCountIndicator.svelte'
  import { getTrueY } from '$lib/utils/core.js'
  import { pixelsPerHour } from '/src/routes/[user]/components/Calendar/store.js'
  import { getContext } from 'svelte'

  const { Task, openTaskPopup } = getContext('app')
  const { startTaskDrag } = getContext('drag-drop')

  let { 
    task = null, // this component assumes `task` is hydrated
    fontSize = 1
   } = $props()

  let height = $derived($pixelsPerHour / 60 * task.duration)
  let isBulletPoint = $derived(height < 24) // 24px is exactly enough to not crop the checkbox and the task name
  let startY = 0

  function startAdjustingDuration (e) {
    e.stopPropagation() // DragContext doesn't get involved, duration adjustment is fully handled within this component
    startY = getTrueY(e)
  }
 
  function adjustDuration (e, task) {
    const hoursPerPixel = 1 / $pixelsPerHour
    const minutesPerPixel = 60 * hoursPerPixel

    const newY = getTrueY(e)
    const durationChange = minutesPerPixel * (newY - startY)

    Task.update({
      id: task.id,
      keyValueChanges: {
        duration: Math.max(1, task.duration + durationChange)
      }
    })
  }
</script> 

<style>
  :root {
    --left-padding: 6px;
    --default-task-color: hsla(210, 20%, 36%, 0.6);

    --experimental-purple: hsla(248, 53%, 58%, 0.6);
    --experimental-red: hsla(0, 100%, 50%, 0.6);
  }

  .calendar-block {
    width: 100%;
    padding-top: var(--left-padding);
    border-radius: var(--left-padding);
    cursor: pointer;
  }
</style>