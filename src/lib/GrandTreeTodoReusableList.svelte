<script>
  import { getRandomID, sortByUnscheduledThenByOrderValue } from '/src/helpers/everythingElse.js'
  import { HEIGHTS } from '/src/helpers/constants.js'
  import UXFormField from '$lib/UXFormField.svelte'
  import ReusableHelperDropzone from '$lib/ReusableHelperDropzone.svelte'
  import RecursiveTaskElement from '$lib/RecursiveTaskElement.svelte'
  import { createEventDispatcher } from 'svelte'
  import { activeDragItem } from '/src/store/index.js'
  import { DateTime } from 'luxon'

  export let listID = ''
  export let allTasksDue = []
  export let listTitle
  export let enableScrolling = false
  export let hasMaxWidth = false // quickfix to prevent complicated flexbox layout ordering issues
  export let willShowCheckbox = true
  export let isLargeFont = false
  export let isRecursive = true

  let tasksToDisplay = []
  let isTypingNewRootTask = false
  let newRootTaskStringValue = ''
  
  const dispatch = createEventDispatcher()

  $: if (allTasksDue) {
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
      createRootTask(newRootTaskStringValue)
      // then reset
      newRootTaskStringValue = ''
    }
  }

  // INTERFACE DIFFERENCE #2
  function createRootTask (taskName) {
    const newRootTaskObj = {
      name: taskName,
      parentID: '',
      timeZone: DateTime.local().zoneName,
    }

    if (tasksToDisplay.length > 0) {
      newRootTaskObj.orderValue = (0 + tasksToDisplay[0].orderValue) / 1.1
    } // otherwise the default `orderValue` will be `maxOrder`, handled by `applyTaskSchema`

    dispatch('task-create', {
      id: getRandomID(),
      newTaskObj: newRootTaskObj
    })
  }

  function handleDroppedTask (e) {
    e.preventDefault()

    dispatch('task-update', { 
      id: $activeDragItem.id, 
      keyValueChanges: {
        listID,
        orderValue: 0.1 + Math.random() * 9.9,
        parentID: ''
      }
    })

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

        <span on:click={startTypingNewTask} on:keydown
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
        listID={listID}
        ancestorRoomIDs={['']}
        roomsInThisLevel={tasksToDisplay}
        idxInThisLevel={0}
        parentID={''}
        colorForDebugging="purple"
        heightInPx={HEIGHTS.ROOT_DROPZONE}
      />

      {#each tasksToDisplay as taskObj, i (taskObj.id)}
        <RecursiveTaskElement
          {taskObj}
          depth={0}
          ancestorRoomIDs={['']}
          doNotShowScheduledTasks={true}
          doNotShowCompletedTasks={true}
          {willShowCheckbox}
          {isLargeFont}
          {isRecursive}
          on:task-click
          on:task-checkbox-change
          on:task-node-update
          on:task-create={e => dispatch('task-create', e.detail)}
        />

        <ReusableHelperDropzone
          listID={listID}
          ancestorRoomIDs={['']}
          roomsInThisLevel={tasksToDisplay}
          idxInThisLevel={i + 1}
          parentID={''}
          colorForDebugging="purple"
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
