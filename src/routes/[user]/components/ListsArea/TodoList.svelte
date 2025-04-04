<script>
  import Dropzone from '../../components/TaskTree/Dropzone.svelte'
  import RecursiveTask from '../../components/TaskTree/RecursiveTask.svelte'
  import FormField from '$lib/components/FormField.svelte'
  import { getRandomID } from '/src/lib/utils/core.js'
  import { HEIGHTS } from '/src/lib/utils/constants.js'
  import Task from '/src/lib/db/models/Task.js'
  import { DateTime } from 'luxon'
  import { onMount, createEventDispatcher } from 'svelte'
  import { user } from '$lib/store'
  import { trees, listenToTasks } from './service.js'

  const dispatch = createEventDispatcher()

  export let treesToDisplay = []
  export let willShowCheckbox = true
  export let isLargeFont = false
  export let triggerNewTask = false

  let isTypingNewRootTask = false
  let newRootTaskStringValue = ''

  onMount(() => {
    listenToTasks($user.uid)
  })
  
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
      timeZone: DateTime.local().zoneName,
    }

    Task.create({
      id: getRandomID(),
      newTaskObj: newRootTaskObj
    })
  }
</script>

<!-- NOTE: background-color: var(--todo-list-bg-color); is not yet unified, so it IS confusing -->
<div style={$$props.style}>
  {#if $trees}
    {#each $trees as taskObj, i (taskObj.id)}
      <div>
        <div style="width: 235px;">
          <Dropzone
            ancestorRoomIDs={['']}
            roomsInThisLevel={treesToDisplay}
            idxInThisLevel={i}
            parentID={''}
            colorForDebugging="purple"
            heightInPx={HEIGHTS.ROOT_DROPZONE}
          />
        </div>

        <div class="list-container">
          <RecursiveTask {taskObj}
            depth={0}
            ancestorRoomIDs={['']}
            {willShowCheckbox}
            {isLargeFont}
          />
        </div>

        <!-- absolute takes it out of flow, so it'd collapse with consecutive dropzones -->
        <div style="position: absolute; width: 235px;">
          <Dropzone
            ancestorRoomIDs={['']}
            roomsInThisLevel={treesToDisplay}
            idxInThisLevel={i+1}
            parentID={''}
            colorForDebugging="purple"
            heightInPx={HEIGHTS.ROOT_DROPZONE}
          />
        </div>
      </div>
    {/each}

    <div style="width: 235px;">
      <Dropzone
        ancestorRoomIDs={['']}
        roomsInThisLevel={treesToDisplay}
        idxInThisLevel={treesToDisplay.length}
        parentID={''}
        colorForDebugging="purple"
        heightInPx={HEIGHTS.ROOT_DROPZONE}
      />
    </div>

    <div on:click={() => isTypingNewRootTask = true} on:keydown class="new-task-icon" style="margin-bottom: 6px;">
      +
    </div>

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
  {/if}

  <slot {startTypingNewTask}>
    
  </slot>
</div>

<style>  
  .list-container {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 0.5vw;
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