<script>
  import Dropzone from '../../components/TaskTree/Dropzone.svelte'
  import RecursiveTask from '../../components/TaskTree/RecursiveTask.svelte'
  import FormField from '$lib/components/FormField.svelte'
  import { getRandomID } from '/src/lib/utils/core.js'
  import { HEIGHTS } from '/src/lib/utils/constants.js'
  import { DateTime } from 'luxon'
  import { onMount, createEventDispatcher } from 'svelte'
  import { trees, listenToTasks } from './service.js'
  import { getContext } from 'svelte'

  const { Task, user } = getContext('app')

  export let willShowCheckbox = true
  export let isLargeFont = false
  export let triggerNewTask = false
  export let listWidth = '320px'

  let topInput = false
  let bottomInput = false
  let newTaskName = ''

  const dispatch = createEventDispatcher()

  onMount(() => {
    listenToTasks($user.uid)
  })
  
  $: if (triggerNewTask && !bottomInput) {
    startTypingNewTask()
    dispatch('newTaskTriggered')
  }
  
  function startTypingNewTask () {
    topInput = true
  }

  function addTaskAbove () {
    if (newTaskName === '') topInput = false

    else {
      createTask({ 
        orderValue: $trees.length ? $trees[0].orderValue / 1.1 : undefined
      })
      newTaskName = ''
      // we don't reset the input to allow for rapid consecutive inputs (double-tap ENTER to be done
    }
  }

  function addTaskBelow (e) {
    if (newTaskName === '') bottomInput = false

    else {
      createTask({ orderValue: undefined })
      newTaskName = ''
    }
  }

  function createTask ({ orderValue }) {
    const newTaskObj = {
      name: newTaskName,
      parentID: '',
      timeZone: DateTime.local().zoneName,
      persistsOnList: false
    }
    if (orderValue) {
      newTaskObj.orderValue = orderValue
    }
    Task.create({ newTaskObj, id: getRandomID() })
  }
  
  function renderDropzone (idx) {
    return {
      idxInThisLevel: idx,
      ancestorRoomIDs: [''],
      roomsInThisLevel: $trees,
      parentID: '',
      colorForDebugging: "purple",
      heightInPx: HEIGHTS.ROOT_DROPZONE
    }
  }
</script>

<!-- NOTE: background-color: var(--todo-list-bg-color); is not yet unified, so it IS confusing -->
<div style={$$props.style}>
  {#if $trees}
    {#if topInput}
      <FormField fieldLabel="Task Name"
        value={newTaskName}
        on:input={e => newTaskName = e.detail.value}
        on:focus-out={() => {
          if (newTaskName === '') topInput = false
        }}
        on:task-entered={e => addTaskAbove(e)}
      />
    {/if}

    {#each $trees as taskObj, i (taskObj.id)}
      <div style="width: {listWidth}">
        <div style="width: 235px;">
          <Dropzone {...renderDropzone(i)} />
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
          <Dropzone {...renderDropzone(i+1)} />
        </div>
      </div>
    {/each}

    <div style="width: 235px;">
      <Dropzone {...renderDropzone($trees.length)} />
    </div>

    <div on:click={() => bottomInput = true} on:keydown class="new-task-icon" style="width: 32px; height: 32px; border-radius: 50%; background-color: white; display: flex; align-items: center; justify-content: center; font-size: 24px;">
      +
    </div>

    {#if bottomInput}
      <FormField fieldLabel="Task Name"
        value={newTaskName}
        on:input={e => newTaskName = e.detail.value}
        on:focus-out={() => {
          if (newTaskName === '') bottomInput = false
        }}
        on:task-entered={e => addTaskBelow(e)}
      />
      <div style="margin-bottom: 8px;"></div>
    {/if}
  {/if}

  <slot {startTypingNewTask}>
    
  </slot>
</div>

<style>  
  .list-container {
    padding: 0.5vw;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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