<script>
  import {
    getDateInDDMMYYYY,
    getRandomID,
    sortByUnscheduledThenByOrderValue,
    convertDDMMYYYYToDateClassObject
  } from '/src/helpers/everythingElse.js'
  import { HEIGHTS } from '/src/helpers/constants.js'
  import UXFormField from '$lib/UXFormField.svelte'
  import ReusableHelperDropzone from '$lib/ReusableHelperDropzone.svelte'
  import RecursiveTaskElement from '$lib/RecursiveTaskElement.svelte'
  import { createEventDispatcher, tick } from 'svelte'
  import {
    breakParentRelationIfNecessary,
    maintainValidSubtreeDeadlines,
    correctDeadlineIfNecessary
  } from '/src/helpers/subtreeDragDrop.js'
  import { user, activeDragItem } from '/src/store/index.js'
  import { writeBatch, doc, increment } from 'firebase/firestore'
  import { db } from '../back-end/firestoreConnection'
  import { DateTime } from 'luxon'

  export let dueInHowManyDays = null // AF(null) means it's a life todo, otherwise it should be a number
  export let allTasksDue = []
  export let listTitle
  export let enableScrolling = false
  export let hasMaxWidth = false // quickfix to prevent complicated flexbox layout ordering issues
  export let willShowCheckbox = true
  export let isLargeFont = false
  export let isRecursive = true

  let defaultDeadline
  let tasksToDisplay = []
  let isTypingNewRootTask = false
  let newRootTaskStringValue = ''
  const dispatch = createEventDispatcher()
  let batch = writeBatch(db)

  // COMPUTE DEFAULT DEADLINE
  $: {
    const d = new Date()
    for (let i = 0; i < dueInHowManyDays; i++) {
      d.setDate(d.getDate() + 1)
    }
    defaultDeadline = getDateInDDMMYYYY(d)
  }

  // svelte reactive statements are order sensitive
  $: if (allTasksDue && allTasksDue.length > 0) {
    computeTasksToDisplay()
  }

  function startTypingNewTask() {
    isTypingNewRootTask = true
  }

  function computeTasksToDisplay() {
    const temp = sortByUnscheduledThenByOrderValue(allTasksDue)
    tasksToDisplay = temp.filter((task) => !task.isDone)
  }

  function handleKeyDown(e) {
    if (newRootTaskStringValue === '') {
      isTypingNewRootTask = false
    }
    // nice side-effect of this: double-tap ENTER to be done
    else {
      createRootTaskWithDeadline(newRootTaskStringValue)
      // then reset
      newRootTaskStringValue = ''
    }
  }

  // INTERFACE DIFFERENCE #2
  function createRootTaskWithDeadline(taskName) {
    const newRootTaskObj = {
      name: taskName,
      startTime: '',
      notes: '',
      templateID: '',
      parentID: '',
      orderValue: 0,
      duration: 30,
      isDone: false,
      imageDownloadURL: '',
      imageFullPath: '',
      startDateISO: '',
      iconURL: '',
      timeZone: DateTime.local().zoneName,
      notify: ''
    }

    if (tasksToDisplay.length > 0) {
      newRootTaskObj.orderValue = (0 + tasksToDisplay[0].orderValue) / 1.1
    } // otherwise the default `orderValue` will be `maxOrder`, handled by `applyTaskSchema`

    dispatch('new-root-task', {
      id: getRandomID(),
      newTaskObj: newRootTaskObj
    })
  }

  function handleDroppedTask(e) {
    e.preventDefault()

    // to be consistent with the API of <ReusableHelperDropzone {parentObj}/>
    const parentObj = { subtreeDeadlineInMsElapsed: Infinity }

    // put task to the bottom of to-do list, if it wasn't already on the to-do list
    let newVal
    if ($activeDragItem.startDate) {
      const initialNumericalDifference = 3
      newVal = $user.maxOrderValue || initialNumericalDifference
      batch.update(doc(db, `/users/${$user.uid}/`), {
        maxOrderValue: increment(initialNumericalDifference)
      })
    } else {
      // don't re-position the todo-task if it's already on the list, leave it as it is
      newVal = $activeDragItem.orderValue
    }

    // 1. ORDER VALUE (and startTime)
    // only applies to the subtree's root
    const { deadlineDate, deadlineTime, id, subtreeDeadlineInMsElapsed } = $activeDragItem

    let updateObj = {
      orderValue: newVal,
      deadlineDate,
      deadlineTime,
      id,
      subtreeDeadlineInMsElapsed
    }

    // 2. UNSCHEDULE: when you drag to the to-do list, it always unschedules it from the calendar
    updateObj.startTime = ''
    updateObj.startDate = ''
    updateObj.startYYYY = ''

    // 3. DEADLINE
    updateObj = correctDeadlineIfNecessary({
      node: updateObj,
      todoListUpperBound: dueInHowManyDays,
      parentObj,
      batch,
      userDoc: $user
    })

    // 4. PARENTID
    updateObj = breakParentRelationIfNecessary(updateObj)

    // 2. HANDLE SUBTREE DEADLINES
    maintainValidSubtreeDeadlines({
      node: $activeDragItem,
      todoListUpperBound: dueInHowManyDays,
      parentObj,
      batch,
      userDoc: $user
    })

    batch.update(
      doc(db, `users/${$user.uid}/tasks/${$activeDragItem.id}`),
      updateObj
    )

    batch.commit()

    batch = writeBatch(db)

    activeDragItem.set(null)
  }

  function dragover_handler(e) {
    e.preventDefault()
  }
</script>

<!-- NOTE: background-color: var(--todo-list-bg-color); is not yet unified,
 so it IS confusing 
-->
<div
  class="todo-list-container"
  style={$$props.style}
  on:drop|stopPropagation={(e) => handleDroppedTask(e)}
  on:dragover={(e) => dragover_handler(e)}
>
  <div
    class="first-column"
    style="height: 100%; display: flex; flex-direction: column;"
  >
    {#if listTitle}
      <div style="display: flex; align-items: center;">
        <div style="font-weight: 600; font-size: 18px; color: rgb(80, 80, 80)">
          {listTitle}
        </div>

        <span on:click={startTypingNewTask}
          class="new-task-icon material-icons"
          style="margin-left: 10px; margin-bottom: 10px"
        >
          +
        </span>
      </div>
    {/if}

    <div
      style="flex-grow: 1; padding: 0px 6px;"
      class:has-max-width={hasMaxWidth}
      class:enable-scrolling={enableScrolling}
    >
      {#if isTypingNewRootTask}
        <UXFormField
          fieldLabel="Task Name"
          value={newRootTaskStringValue}
          on:input={(e) => (newRootTaskStringValue = e.detail.value)}
          on:focus-out={() => {
            if (newRootTaskStringValue === '') {
              isTypingNewRootTask = false
            }
          }}
          on:task-entered={(e) => handleKeyDown(e)}
        />
        <div style="margin-bottom: 8px;"></div>
      {/if}

      <ReusableHelperDropzone
        ancestorRoomIDs={['']}
        roomsInThisLevel={tasksToDisplay}
        idxInThisLevel={0}
        parentID={''}
        parentObj={{
          subtreeDeadlineInMsElapsed:
            convertDDMMYYYYToDateClassObject(defaultDeadline).getTime()
        }}
        colorForDebugging="purple"
        {dueInHowManyDays}
        heightInPx={HEIGHTS.ROOT_DROPZONE}
      />

      {#each tasksToDisplay as taskObj, i (taskObj.id)}
        <RecursiveTaskElement
          {taskObj}
          depth={0}
          ancestorRoomIDs={['']}
          doNotShowScheduledTasks={true}
          doNotShowCompletedTasks={true}
          {dueInHowManyDays}
          {willShowCheckbox}
          {isLargeFont}
          {isRecursive}
          on:task-click
          on:task-checkbox-change
          on:task-node-update
          on:subtask-create
        />

        <ReusableHelperDropzone
          ancestorRoomIDs={['']}
          roomsInThisLevel={tasksToDisplay}
          idxInThisLevel={i + 1}
          parentID={''}
          parentObj={{
            subtreeDeadlineInMsElapsed:
              convertDDMMYYYYToDateClassObject(defaultDeadline).getTime()
          }}
          colorForDebugging="purple"
          {dueInHowManyDays}
          heightInPx={HEIGHTS.ROOT_DROPZONE}
        />
      {/each}

      <!-- NOTE: BECAUSE WE DON'T DISPLAY TASKS THAT ARE COMPLETED,
        WE HAVE A DEVIATION BETWEEN STATE AND UI
        IN THE FUTURE IF THERE ARE UNEXPECTED BUGS, THIS IS THE LIKELY CAUSE
      -->
    </div>
  </div>

  <slot {startTypingNewTask}></slot>
</div>

<style>
  .todo-list-container {
    /* width: 100%; will cause the strange shifting out of screen bug*/
    height: 100%;
    padding-bottom: 16px;
    padding-left: 2vw;
    padding-right: 2vw;
    font-size: 2em;
  }

  .enable-scrolling {
    overflow-y: auto;
  }

  /* This saves a lot of pain, trust me. I have no idea why the flexboxes don't shrink with flex-basis, flex-shrink etc. and upon further research it looks like 
    it can get extremely complicated, and that CSS grid could be a better solution.
  */
  .has-max-width {
    max-width: 21.2vw;
  }

  .first-column {
    flex-basis: 100%;
  }
</style>
