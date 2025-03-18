<div style="position: relative; width: 100%; font-weight: {depthAdjustedFontWeight};">
  <div draggable="true"
    on:dragstart|self={(e) => dragstart_handler(e, taskObj.id)}
    style="display: flex; align-items: center; opacity: {taskObj.isDone ? '0.6' : '1'};"
    style:margin-left="{willShowCheckbox ? '' : '-30px'}"
  >
    <div class="task-row-container" style="font-size: {depthAdjustedFontSize};">   
      {#if willShowCheckbox}
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
      </div>
    </div>

    <div on:click={() => isTypingNewSubtask = true} on:keydown class="new-task-icon" style="margin-bottom: 6px;">
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
  {:else}
    <div style="margin-left: {indentationAmount}px;">
      <!-- how we fill dropzones: define the top dropzone, then have each sub-task create a dropzone below themselves -->
      <div class:ghost-negative={n === 0} 
        style="
          width: calc(235px - {indentationAmount * (depth)}px);
          z-index: {depth};
        "
      >
        <Dropzone
          ancestorRoomIDs={[taskObj.id, ...ancestorRoomIDs]}
          roomsInThisLevel={taskObj.children}
          idxInThisLevel={0}
          parentID={taskObj.id}
          {colorForDebugging}
          listID={taskObj.listID}
        /> 
      </div>

      {#each taskObj.children as subtaskObj, i (subtaskObj.id)}
        <RecursiveTask 
          taskObj={subtaskObj}
          depth={depth+1}
          willShowCheckbox
          ancestorRoomIDs={[taskObj.id, ...ancestorRoomIDs]}
          {isLargeFont}
          {colorForDebugging}
        /> 

        <div class:ghost-negative={i === n - 1} 
          style="
            width: calc(235px - {indentationAmount * depth}px); 
            z-index: {depth};
          "
        >
          <Dropzone
            ancestorRoomIDs={[taskObj.id, ...ancestorRoomIDs]}
            roomsInThisLevel={taskObj.children}
            idxInThisLevel={i + 1}
            parentID={taskObj.id}
            {colorForDebugging}
            listID={taskObj.listID}
          /> 
        </div>
      {/each}
    </div>
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
      on:task-entered={(e) => onEnter(e)}
    />
  {/if}
</div>

<script>
  import FormField from '$lib/Reusable/FormField.svelte'
  import RecursiveTask from './RecursiveTask.svelte'
  import Checkbox from '$lib/Reusable/Checkbox.svelte'
  import Dropzone from './Dropzone.svelte'
  import TimelineRenderer from './TimelineRenderer.svelte'
  import { 
    getRandomID, 
    getRandomColor,
  } from '/src/helpers/utils.js'
  import { activeDragItem } from '/src/store'
  import { openTaskPopup } from '/src/store/taskPopupStore.js'
  import { updateTaskNode, createTaskNode } from '/src/helpers/crud.js'

  export let taskObj
  export let depth 
  export let willShowCheckbox = true
  export let ancestorRoomIDs = [] // ancestorRoomIDs prevent a parent from becoming its own parent, creating an infinite cycle
  export let colorForDebugging = getRandomColor()
  export let isLargeFont = false

  const indentationAmount = 32
  let newSubtaskStringValue = ''
  let isTypingNewSubtask = false
  let depthAdjustedFontSize 

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
    updateTaskNode({
      id: taskObj.id,
      keyValueChanges: { isDone: e.target.checked }
    })
  }

  function dragstart_handler (e, id) {
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
    createTaskNode({
      id: getRandomID(),
      newTaskObj: {
        name,
        parentID: taskObj.id, 
        listID: taskObj.listID,
        // Inherit parent's childrenLayout by default, can be changed later
        childrenLayout: taskObj.childrenLayout || 'normal'
      }
    })
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
</style> 