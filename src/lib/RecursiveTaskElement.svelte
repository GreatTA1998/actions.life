{#if !(doNotShowScheduledTasks && taskObj.startDate) && !(doNotShowCompletedTasks && taskObj.isDone)}
  <div style="position: relative; width: 100%; font-weight: {depthAdjustedFontWeight};">
    <div 
      draggable="true"
      on:dragstart|self={(e) => dragstart_handler(e, taskObj.id)}
      style="display: flex; align-items: center; opacity: {taskObj.isDone ? '0.6' : '1'};"
    >
      <div class="task-row-container" style="font-size: {depthAdjustedFontSize};">   
        {#if willShowCheckbox}
          <div style="margin-left: 2px; margin-right: 4px;">
            <ReusableCheckbox 
              value={taskObj.isDone}
              on:change={(e) => handleCheckboxChange(e)}
            />
          </div>
        {/if}

        <div on:click={() => dispatch('task-click', { task: taskObj })}
          class="truncate-to-one-line" 
          class:cross-out-todo={taskObj.isDone} 
          style="margin-top: -1px; margin-left: 0px; cursor: pointer; min-width: 16px; min-height: 16px;"
        >
          <!-- {taskObj.orderValue}  -->
          {taskObj.name}
        </div>
      </div>

      <div on:click={() => isTypingNewSubtask = true} class="new-task-icon" style="margin-bottom: 6px;">
        +
      </div>
    </div>

    <!-- 
      DROPZONE BELOW THE TASK
      
      We use `235px` instead of `100%` because absolute's 100% is different from
      RecursiveTaskElement's 100% (which is constantly shrinking). A fixd value we subtract from 
      gives us a consistent base
    -->
    <div style="margin-left: {indentationAmount}px;">
      <div 
        class:absolute-bottom={n === 0} 
        style="
          width: calc(235px - {indentationAmount * (depth)}px);
          z-index: {depth};
        "
      >
        <ReusableHelperDropzone
          ancestorRoomIDs={[taskObj.id, ...ancestorRoomIDs]}
          roomsInThisLevel={taskObj.children}
          idxInThisLevel={0}
          parentID={taskObj.id}
          parentObj={taskObj}
          {colorForDebugging}
          {dueInHowManyDays}
          {isMilestoneMode}
        /> 
      </div>

      <!-- CHILDREN DROPZONES -->
      {#each notDoneChildren as subtaskObj, i (subtaskObj.id)}
        <RecursiveTaskElement 
          taskObj={subtaskObj}
          depth={depth+1}
          {doNotShowScheduledTasks}
          {doNotShowCompletedTasks}
          {willShowCheckbox}
          ancestorRoomIDs={[taskObj.id, ...ancestorRoomIDs]}
          subtreeDeadlineInMsElapsed={updateSubtreeDeadlineInMsElapsed(taskObj, subtreeDeadlineInMsElapsed)}
          {dueInHowManyDays}
          {isMilestoneMode}
          {isLargeFont}
          {isRecursive}
          on:task-click
          on:subtask-create
          on:task-checkbox-change
        /> 
        <!-- 
          Caveat with using calc(100%):
          because absolute element's 100% ignores the margin = `indentationAmount` that
          all has already scoped other normal divs, so we just add it back 

          - {i === n - 1 ? indentationAmount : 0}px 
        -->
        <div class:absolute-bottom={i === n - 1} 
          style="
            width: calc(
              235px 
              - {indentationAmount * depth}px 
            ); 
            z-index: {depth};
          "
        >
          <ReusableHelperDropzone
            ancestorRoomIDs={[taskObj.id, ...ancestorRoomIDs]}
            roomsInThisLevel={taskObj.children}
            idxInThisLevel={i + 1}
            parentID={taskObj.id}
            parentObj={taskObj}
            {colorForDebugging}
            {dueInHowManyDays}
            {isMilestoneMode}
          /> 
        </div>
      {/each}
      
      {#if isTypingNewSubtask}
        <UXFormField
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
    </div>
  </div>
{/if}

<script>
  import UXFormField from '$lib/UXFormField.svelte'
  import RecursiveTaskElement from '$lib/RecursiveTaskElement.svelte'
  import ReusableCheckbox from '$lib/ReusableCheckbox.svelte'
  import ReusableHelperDropzone from '$lib/ReusableHelperDropzone.svelte'
  import { 
    convertDDMMYYYYToDateClassObject, 
    computeDayDifference, 
    getDateInDDMMYYYY, 
    getRandomID, 
    getRandomColor,
    getTimeInHHMM,
  } from '/src/helpers/everythingElse.js'
  import { updateSubtreeDeadlineInMsElapsed } from '/src/helpers/dataStructures.js'
  import { createEventDispatcher, tick } from 'svelte'
  import { 
    mostRecentlyCompletedTaskID, 
    activeDragItem
  } from '/src/store'

  export let taskObj
  export let depth 
  export let doNotShowScheduledTasks = false
  export let doNotShowCompletedTasks = false
  export let willShowCheckbox = true
  // ancestorRoomIDs prevent a parent from becoming its own parent,
  // creating an infinite cycle that will not get rendered by Svelte
  export let ancestorRoomIDs
  export let colorForDebugging = getRandomColor()
  export let subtreeDeadlineInMsElapsed = Infinity
  export let dueInHowManyDays // very relevant for todo list tasks
  export let isMilestoneMode = false
  export let isLargeFont = false
  export let isRecursive = true

  const indentationAmount = 32
  let newSubtaskStringValue = ''
  let isTypingNewSubtask = false
  let isTaskDueSoonOrOverdue = false

  let depthAdjustedFontSize 

  const dispatch = createEventDispatcher()

  $: notDoneChildren = taskObj.children.filter(child => !child.isDone)

  $: n = notDoneChildren.length 

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
  
  // depthAdjustedFontSize = 1 * (0.6 ** (depth)
  $: depthAdjustedFontWeight = 400 - (depth * 0) + (200 * Math.max(1 - depth, 0))

  // calculate if a task is 1 day before the deadline / overdue
  $: if (taskObj.deadlineDate && taskObj.deadlineTime) {
    const d1 = new Date()
    const d2 = convertDDMMYYYYToDateClassObject(taskObj.deadlineDate, taskObj.deadlineTime)

    const dayDiff = computeDayDifference(d1, d2)
    if (dayDiff <= 1) {
      isTaskDueSoonOrOverdue = true
    }
  }

  // the other place to pay attention to is <DetailedCardPopup/>
  // but the idea is still the same, provide an "undo"
  // for root level tasks because they disappear on completion
  function handleCheckboxChange (e) {
    if (depth === 0) {
      mostRecentlyCompletedTaskID.set(taskObj.id)
    }
    dispatch('task-checkbox-change', {
      id: taskObj.id,
      isDone: e.target.checked
    })
  }

  function dragstart_handler(e, id) {
    e.dataTransfer.setData("text/plain", id)

    const payload = { ...taskObj }

    if (depth === 0) payload.kind = 'top-level-task-within-this-todo-list'
    else payload.kind = 'room'

    activeDragItem.set(payload)
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

  function createSubtask (name) {
    const newTaskID = getRandomID()
    const subtaskObj = {
      id: newTaskID,
      parentID: taskObj.id, 
      name
    }

    // we're creating a sub-task, so the sub-task's deadline
    // is bounded by this parent task's deadline

    // QUICKFIX: life's tasks have no deadlines, but consider setting it to `Infinity` 
    // to simplify computations
    if (taskObj.deadlineDate && taskObj.deadlineTime) {
      const d = convertDDMMYYYYToDateClassObject(taskObj.deadlineDate, taskObj.deadlineTime)
      subtaskObj.deadlineDate = getDateInDDMMYYYY(d)
      subtaskObj.deadlineTime = getTimeInHHMM({ dateClassObj: d })

      // careful that "NaN/NaN" still counts as having a deadline, which silently makes the tasks disappear
      // as it is not categorized into a day, week or year todo bucket.
    }
    
    dispatch('subtask-create', {
      id: newTaskID,
      parentID: taskObj.id,
      newTaskObj: subtaskObj
    })
  }
</script>

<style>
  .absolute-bottom {
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
</style>