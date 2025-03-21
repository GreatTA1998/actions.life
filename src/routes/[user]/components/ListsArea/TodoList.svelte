<script>
  import Dropzone from '../../components/TaskTree/Dropzone.svelte'
  import RecursiveTask from '../../components/TaskTree/RecursiveTask.svelte'
  import FormField from '$lib/Reusable/FormField.svelte'
  import { getRandomID } from '/src/utils/core.js'
  import { HEIGHTS } from '/src/utils/constants.js'
  import { DateTime } from 'luxon'
  import Task from '/src/db/models/Task.js'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let listID = ''
  export let tasksToDisplay = []
  export let listTitle
  export let enableScrolling = false
  export let hasMaxWidth = false // quickfix to prevent complicated flexbox layout ordering issues
  export let willShowCheckbox = true
  export let isLargeFont = false
  export let hideListTitle = false
  export let triggerNewTask = false

  let isTypingNewRootTask = false
  let newRootTaskStringValue = ''
  
  $: if (triggerNewTask && !isTypingNewRootTask) {
    startTypingNewTask()
    dispatch('newTaskTriggered')
  }
  
  function startTypingNewTask() {
    isTypingNewRootTask = true
  }

  function handleKeyDown(e) {
    if (newRootTaskStringValue === '') {
      isTypingNewRootTask = false
    }
    // nice side-effect of this: double-tap ENTER to be done
    else {
      createRootTask(newRootTaskStringValue)
      newRootTaskStringValue = ''
    }
  }

  function createRootTask (taskName) {
    const newRootTaskObj = {
      name: taskName,
      parentID: '',
      listID,
      timeZone: DateTime.local().zoneName,
    }
    if (tasksToDisplay.length > 0) {
      newRootTaskObj.orderValue = (0 + tasksToDisplay[0].orderValue) / 1.1
    }
    Task.create({
      id: getRandomID(),
      newTaskObj: newRootTaskObj
    })
  }
</script>

<!-- NOTE: background-color: var(--todo-list-bg-color); is not yet unified, so it IS confusing -->
<div class="todo-list-container" style={$$props.style}>
  <div class="first-column">
    {#if listTitle && !hideListTitle}
      <div style="display: flex; align-items: center;">
        <div style="font-weight: 600; font-size: 18px; color: rgb(80, 80, 80)">
          {listTitle}
        </div>

        <span on:click={startTypingNewTask} on:keydown
          class="new-task-icon material-icons"
          style="margin-left: 10px; margin-bottom: 10px; cursor: pointer;"
        >
          +
        </span>
      </div>
    {/if}

    <div style="flex-grow: 1; padding: 0px 6px;"
      class:has-max-width={hasMaxWidth}
      class:enable-scrolling={enableScrolling}
    >
      {#if isTypingNewRootTask}
        <FormField
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

      <Dropzone
        {listID}
        ancestorRoomIDs={['']}
        roomsInThisLevel={tasksToDisplay}
        idxInThisLevel={0}
        parentID={''}
        colorForDebugging="purple"
        heightInPx={HEIGHTS.ROOT_DROPZONE}
      />

      {#each tasksToDisplay as taskObj, i (taskObj.id)}
        <RecursiveTask {taskObj}
          depth={0}
          ancestorRoomIDs={['']}
          {willShowCheckbox}
          {isLargeFont}
        />

        <Dropzone
          {listID}
          ancestorRoomIDs={['']}
          roomsInThisLevel={tasksToDisplay}
          idxInThisLevel={i + 1}
          parentID={''}
          colorForDebugging="purple"
          heightInPx={HEIGHTS.ROOT_DROPZONE}
        />
      {/each}
    </div>
  </div>

  <slot {startTypingNewTask}>
    
  </slot>
</div>

<style>
  .todo-list-container {
    /* width: 100%; will cause the strange shifting out of screen bug*/
    height: 100%;
    padding-bottom: 16px;
    padding-left: 1vw;
    padding-right: 1vw;
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
    height: 100%; 
    display: flex; 
    flex-direction: column;
  }
  
  .new-task-icon {
    font-size: 24px;
    color: #666;
    transition: color 0.2s;
  }
  
  .new-task-icon:hover {
    color: #333;
  }
</style>