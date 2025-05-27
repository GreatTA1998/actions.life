<div style="position: relative; width: 100%; font-weight: {depthAdjustedFontWeight};">
  <div draggable="true"
    on:dragstart|self={(e) => dragstart_handler(e, taskObj.id)}
    style="
      display: flex; align-items: center;
      font-size: {depthAdjustedFontSize};
    "
    class="task-row-container"
  >
    {#if willShowCheckbox && taskObj.childrenLayout !== 'timeline'}
      <div style="margin-left: 2px; margin-right: 4px;">
        <Checkbox 
          value={taskObj.isDone}
          on:change={(e) => handleCheckboxChange(e)}
        />
      </div>
    {:else}
      <slot/>

      <div style="margin-right: 6px;"></div>
    {/if}

    <button on:click={() => openTaskPopup(taskObj)} class="task-name truncate-to-one-line" class:done-task={taskObj.isDone}>
      {taskObj.name}
    </button>

    {#if taskObj.isCollapsed && taskObj.children.length > 0}
      <button class="subtask-progress-badge" on:click={() => Task.update({ id: taskObj.id, keyValueChanges: { isCollapsed: false } })}>
        <span class="material-symbols-outlined" style="font-size: 16px;">check_circle</span>
        {taskObj.children.filter(child => child.isDone).length}/
        {taskObj.children.length}
      </button>
    {/if}

    {#if taskObj.startDateISO >= DateTime.now().toFormat('yyyy-MM-dd')}
      <span class="schedule-badge">
        {DateTime.fromISO(taskObj.startDateISO + (taskObj.startTime ? 'T' + taskObj.startTime : '')).toRelative()}
      </span>
    {/if}

    <TaskMenu {taskObj} 
      on:subtask-add={() => isTypingNewSubtask = true } 
    />
  </div>

  {#if taskObj.childrenLayout === 'timeline' && taskObj.children.length > 0}
    {#if !taskObj.isCollapsed}
      <TimelineRenderer
        children={taskObj.children}
        parentID={taskObj.id}
        {depth}
        {ancestorRoomIDs}
        {isLargeFont}
        {colorForDebugging}
      />
    {/if}

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

      {#if !taskObj.isCollapsed}
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
      {/if}
    </div>
  {/if}
</div>

<script>
  import FormField from '$lib/components/FormField.svelte'
  import RecursiveTask from './RecursiveTask.svelte'
  import Checkbox from '$lib/components/Checkbox.svelte'
  import Dropzone from './Dropzone.svelte'
  import TimelineRenderer from './TimelineRenderer.svelte'
  import TaskMenu from './TaskMenu.svelte'
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
    min-width: 16px; 
    min-height: 16px;
  }

  .ghost-negative {
    position: absolute; 
    bottom: -18px;
  }

  .task-row-container {
    min-width: 30px; /* min-width and height to make it easy to delete legacy tasks with no titles */
    max-width: 320px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: rgb(80, 80, 80);
  }

  .done-task {
    background: linear-gradient(to right, rgba(76, 175, 80, 0.04), transparent 50%);
    color: #388e3c;
    border-radius: 4px;
    transition: background 0.2s, color 0.2s;
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

  .subtask-progress-badge {
    margin-left: 6px;
    display: flex;
    align-items: center;
    column-gap: 2px;
    color: inherit;
    font-size: 14px;
    font-weight: 400;
    background: none;
    border-radius: 0;
    padding: 0;
  }
</style> 