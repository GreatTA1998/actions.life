<div style="position: relative; width: 100%; font-weight: {depthAdjustedFontWeight};">
  <div draggable="true"
    on:dragstart|self={(e) => dragstart_handler(e, taskObj.id)}
    style="display: flex; align-items: center; opacity: {taskObj.isDone ? '0.6' : '1'};"
  >
    <div class="task-row-container" style="font-size: {depthAdjustedFontSize};">   
      {#if willShowCheckbox && taskObj.childrenLayout !== 'timeline'}
        <div style="margin-left: 2px; margin-right: 4px;">
          <Checkbox 
            value={taskObj.isDone}
            on:change={(e) => handleCheckboxChange(e)}
          />
        </div>
      {:else}
        <slot>

        </slot>

        <div style="margin-right: 6px;"></div>
      {/if}

      <div on:click={() => openTaskPopup(taskObj)} on:keydown
        class="task-name truncate-to-one-line" 
        class:cross-out-todo={taskObj.isDone} 
      >
        <!-- {taskObj.orderValue}  -->
        {taskObj.name}
        
        {#if taskObj.startDateISO}
          <span class="schedule-badge">
            {DateTime.fromISO(taskObj.startDateISO).toRelative()}
            {taskObj.startTime}
          </span>
        {/if}
      </div>
    </div>

    <div on:click={() => isTypingNewSubtask = true} on:keydown class="new-task-icon" style="margin-bottom: 6px; font-size: {isLargeFont ? '48px' : ''}">
      +
    </div>
  </div>

  {#if taskObj.childrenLayout === 'timeline' && taskObj.children.length > 0}
    <TimelineRenderer
      children={taskObj.children}
      depth={depth}
      parentID={taskObj.id}
      ancestorRoomIDs={ancestorRoomIDs}
      {isLargeFont}
      {colorForDebugging}
    />

    {#if isTypingNewSubtask}  
      <FormField
        fieldLabel="Task Name"
        value={newSubtaskStringValue}
        on:input={(e) => newSubtaskStringValue = e.detail.value}
        on:focus-out={() => {
          if (newSubtaskStringValue === '') {
            isTypingNewSubtask = false
          }
        }}
        on:task-entered={e => createTimelineStep(e)}
      />
    {/if}
  {:else}
    <div style="margin-left: {WIDTHS.SUBTASK_LEFT_MARGIN}px;">
      {#if isTypingNewSubtask}  
        <FormField
          fieldLabel="Task Name"
          value={newSubtaskStringValue}
          on:input={(e) => newSubtaskStringValue = e.detail.value}
          on:focus-out={() => {
            if (newSubtaskStringValue === '') {
              isTypingNewSubtask = false
            }
          }}
          on:task-entered={(e) => onEnter(e)}
        />
      {/if}

      <div class:ghost-negative={n === 0} 
        style="
          width: 235px;
          left: {WIDTHS.DROPZONE_LEFT_MARGIN * (depth)}px;
          z-index: {depth};
        "
      >
        <Dropzone
          ancestorRoomIDs={[taskObj.id, ...ancestorRoomIDs]}
          roomsInThisLevel={taskObj.children}
          idxInThisLevel={0}
          parentID={taskObj.id}
          {colorForDebugging}
        /> 
      </div>

      {#each taskObj.children as subtaskObj, i (subtaskObj.id)}
        <RecursiveTask 
          taskObj={subtaskObj}
          depth={depth+1}
          willShowCheckbox
          ancestorRoomIDs={[taskObj.id, ...ancestorRoomIDs]}
          {isLargeFont}
        /> 

        <div class:ghost-negative={i === n - 1} 
          style="
            left: {WIDTHS.SUBTASK_LEFT_MARGIN + WIDTHS.DROPZONE_LEFT_MARGIN * (depth)}px;
            z-index: {depth};
            width: 235px;
          "
        >
          <Dropzone
            ancestorRoomIDs={[taskObj.id, ...ancestorRoomIDs]}
            roomsInThisLevel={taskObj.children}
            idxInThisLevel={i + 1}
            parentID={taskObj.id}
            {colorForDebugging}
          /> 
        </div>
      {/each}
    </div>
  {/if}
</div>

<script>
  import FormField from '$lib/components/FormField.svelte'
  import RecursiveTask from './RecursiveTask.svelte'
  import Checkbox from '$lib/components/Checkbox.svelte'
  import Dropzone from './Dropzone.svelte'
  import TimelineRenderer from './TimelineRenderer.svelte'
  import { 
    getRandomID, 
    getRandomColor,
  } from '/src/lib/utils/core.js'
  import { activeDragItem, openTaskPopup } from '/src/lib/store'
  import Task from '/src/lib/db/models/Task.js'
  import { WIDTHS } from '/src/lib/utils/constants.js'
  import { DateTime } from 'luxon'

  export let taskObj
  export let depth 
  export let willShowCheckbox = true
  export let ancestorRoomIDs = [] // ancestorRoomIDs prevent a parent from becoming its own parent, creating an infinite cycle
  export let isLargeFont = false

  let newSubtaskStringValue = ''
  let isTypingNewSubtask = false
  let depthAdjustedFontSize
  const colorForDebugging = getRandomColor()

  $: n = taskObj.children.length 

  $: if (depth >= 0) {
    switch (depth) {
      case 0:
        if (isLargeFont) depthAdjustedFontSize = '32px'
        else depthAdjustedFontSize = '16px'
        break
      default: 
        if (isLargeFont) depthAdjustedFontSize = '28px'
        else depthAdjustedFontSize = '14px'
    }
  }
  
  $: depthAdjustedFontWeight = 400 - (depth * 0) + (200 * Math.max(1 - depth, 0))

  function handleCheckboxChange (e) {
    Task.update({
      id: taskObj.id,
      keyValueChanges: { isDone: e.target.checked }
    })
  }

  function dragstart_handler (e, id) {
    e.dataTransfer.setData("text/plain", id)
    activeDragItem.set({ 
      kind: 'room', 
      ...taskObj 
    })
  }

  function onEnter (e) {
    if (newSubtaskStringValue === '') {
      isTypingNewSubtask = false
    }
    else {
      createSubtask(newSubtaskStringValue)
      newSubtaskStringValue = ''
    } 
  }

  function createTimelineStep (e) {
    if (newSubtaskStringValue === '') {
      isTypingNewSubtask = false
    }
    else {
      Task.create({
        id: getRandomID(),
        newTaskObj: {
          name: newSubtaskStringValue,
          parentID: taskObj.id,
          childrenLayout: 'normal'
          // we purposely don't set `orderValue`,  so it'll be added to the end of the timeline sequentially
        }
      })
      newSubtaskStringValue = ''
    } 
  }

  function createSubtask (name) {
    const newTaskObj = {
      name,
      parentID: taskObj.id, 
      childrenLayout: 'normal'
    }

    if (taskObj.children.length > 0) {
      newTaskObj.orderValue = (taskObj.children[0].orderValue) / 1.1
    } 
    // Task.create(), by default, initializes `$user.maxOrderValue`

    Task.create({ id: getRandomID(), newTaskObj })
  }
</script>

<style>
  .task-name {
    margin-top: -1px; 
    margin-left: 0px; 
    cursor: pointer; 
    min-width: 16px; 
    min-height: 16px;
  }

  .ghost-negative {
    position: absolute; 
    bottom: -18px;
  }

  /* min-width and height to make it easy to delete legacy tasks with no titles */
  .task-row-container {
    min-width: 30px; 
    max-width: 320px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: rgb(80, 80, 80);
    display: flex;
    align-items: center;
  }

  .cross-out-todo {
    text-decoration: line-through;
  }

  .schedule-badge {
    display: inline-block;
    margin-left: 8px;
    padding: 1px 6px;
    border-radius: 4px;
    background-color: #f0f0f0;
    color: #666;
    font-size: 0.85em;
    font-weight: normal;
  }
</style> 