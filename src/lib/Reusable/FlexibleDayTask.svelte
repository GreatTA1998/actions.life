<div on:click={() => openTaskPopup(task)}
  draggable="true" 
  on:dragstart|self={(e) => startDragMove(e, task.id)} 
  class:calendar-block={!isBulletPoint}
  style="
    position: relative;
    height: fit-content; 
    min-height: 12px;
    opacity: {task.isDone ? '1' : '0.7'};
    padding-left: {isBulletPoint ? '0px' : 'var(--left-padding)'};
    padding-right: var(--left-padding);
    display: flex; flex-direction: column;
  " 
  on:keydown={() => {}}
>
 <!-- As long as this parent div is correctly sized, the duration adjusting area 
   will be positioned correctly (it's glued to the bottom of this parent div)

   `min-height` prevents the parent from being super small when it's bullet point mode
 -->
 <div style="display: flex; align-items: center; width: {cssWidth};">
    <div>
      <!-- `checked` hydrates the initial value 
        `task-update` event will just toggle the checkbox, 
        but in case we ever need the new value, it's `e.target.checked`
      -->
      <Checkbox
        value={task.isDone}
        on:change={(e) => updateTaskNode({
          id: task.id,
          keyValueChanges: {
            isDone: e.target.checked
          }
        })}
      />
    </div>

   <div class="task-name truncate-to-one-line" style="font-size: {fontSizeInPx}px; margin-left: 4px;">
     {task.name}
   </div>
 </div>
 <!-- End of task name flexbox -->
</div>

<script>
  // Assumes `task` is hydrated
  import { grabOffset, activeDragItem, openTaskPopup } from '/src/store'
  import Checkbox from './Checkbox.svelte'
  import { updateTaskNode } from '/src/db/crud.js'

  export let task = null
  export let pixelsPerHour = null
  export let fontSizeInPx = 12
  export let cssWidth = 'var(--width-calendar-day-section)'

  $: height = (pixelsPerHour / 60) * task.duration
  $: isBulletPoint = height < 20

  function startDragMove (e, id) {
    e.dataTransfer.setData("text/plain", id)

    const rect = e.target.getBoundingClientRect()
    grabOffset.set(e.clientY - rect.top)

    activeDragItem.set({
      kind: 'room',
      ...task
    })
  }
</script> 

<style>
 :root {
   --left-padding: 6px;
 }

 .calendar-block {
   width: 100%;
   padding-top: var(--left-padding);
   cursor: pointer;
   border-radius: var(--left-padding);
 }

 .task-name {
   margin-top: -1px; 
   margin-left: 4px; 
   width: 100%;
   cursor: pointer; 
 }
</style>