<script>
  import RecursiveTask from './RecursiveTask.svelte'
  import Dropzone from './Dropzone.svelte'
  import SubtaskCountIndicator from '$lib/components/SubtaskCountIndicator.svelte'
  import FormField from '$lib/components/FormField.svelte'
  import Checkbox from '$lib/components/Checkbox.svelte'
  import TimelineRenderer from './TimelineRenderer.svelte'
  import TaskMenu from './TaskMenu.svelte'
  import TaskCaret from './TaskCaret.svelte'
  import { getRandomID, getRandomColor } from '$lib/utils/core.js'
  import { WIDTHS } from '$lib/utils/constants.js'
  import { DateTime } from 'luxon'
  import { getContext } from 'svelte'

  const { Task, openTaskPopup } = getContext('app')
  const { startTaskDrag, draggedItem } = getContext('drag-drop')

  let {
    taskObj,
    depth,
    willShowCheckbox = true,
    ancestorRoomIDs = [], // ancestorRoomIDs prevent a parent from becoming its own parent, creating an infinite cycle
    isLargeFont = false,
    verticalTimeline,
    infoBadge
  } = $props()

  const colorForDebugging = getRandomColor()

  let newSubtaskStringValue = $state('')
  let isTypingNewSubtask = $state(false)
  let n = $derived(taskObj.children.length)
  let depthAdjustedFontSize = $derived.by(() => {
    let depthAdjustedFontSize = ''
    switch (depth) {
      case 0:
        if (isLargeFont) depthAdjustedFontSize = '32px'
        else depthAdjustedFontSize = '16px'
        break
      default: 
        if (isLargeFont) depthAdjustedFontSize = '28px'
        else depthAdjustedFontSize = '14px'
    }
    return depthAdjustedFontSize
  })
  
  let depthAdjustedFontWeight = $derived(400 - (depth * 0) + (200 * Math.max(1 - depth, 0)))

  function handleCheckboxChange (e) {
    Task.update({
      id: taskObj.id,
      keyValueChanges: { isDone: e.target.checked }
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

    if (n > 0) {
      newTaskObj.orderValue = (taskObj.children[0].orderValue) / 1.1
    } 
    // Task.create(), by default, initializes `$user.maxOrderValue`

    Task.create({ id: getRandomID(), newTaskObj })
  }

  function renderDropzone (idx) {
    return {
      ancestorRoomIDs: [taskObj.id, ...ancestorRoomIDs],
      roomsInThisLevel: taskObj.children,
      idxInThisLevel: idx,
      parentID: taskObj.id,
      colorForDebugging
    }
  }
</script>

<div style="position: relative; width: 100%; font-weight: {depthAdjustedFontWeight};">
  <div draggable="true"
    ondragstart={e => startTaskDrag(e, taskObj.id, { draggedItem })}
    style="font-size: {depthAdjustedFontSize};"
    class="task-row-container unselectable"
  >
    {#if willShowCheckbox}
      <div style="position: relative; margin-left: 2px; margin-right: 4px;">
        {@render verticalTimeline?.()}

        <div style="background-color: white; position: relative; padding-top: 2px; padding-bottom: 2px;">
          {#if n === 0}
            <Checkbox value={taskObj.isDone}
              onchange={e => handleCheckboxChange(e)}
            />
          {:else}
            <TaskCaret isCollapsed={taskObj.isCollapsed}
              onToggle={() => Task.update({ id: taskObj.id, keyValueChanges: { isCollapsed: !taskObj.isCollapsed } })}
            />
          {/if}
        </div>
      </div>
    {/if}

    <button onclick={() => openTaskPopup(taskObj)} 
      class="task-name truncate-to-one-line" 
      class:done-task={taskObj.isDone} 
    >
      {taskObj.name}
    </button>

    <div style="margin-left: 6px;"></div>

    <div style="display: flex; align-items: center; column-gap: 4px;">
      {#if infoBadge}
        {@render infoBadge()}
      {:else if taskObj.startDateISO}
        <span class:overdue={taskObj.startDateISO < DateTime.now().toFormat('yyyy-MM-dd')} 
          class="material-symbols-outlined" style="font-size: 12px;" 
        >
          calendar_today
        </span>
      {/if}

      {#if taskObj.isCollapsed && n > 0}
        <SubtaskCountIndicator {taskObj} onclick={() => openTaskPopup(taskObj)} />
      {/if}
    </div>

    <TaskMenu {taskObj} 
      onSubtaskAdd={() => isTypingNewSubtask = true } 
    />
  </div>

  {#if taskObj.childrenLayout === 'timeline'}
    <TimelineRenderer
      {taskObj}
      children={taskObj.children}
      parentID={taskObj.id}
      {depth}
      {ancestorRoomIDs}
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
    <div style="margin-left: {WIDTHS.INDENT_PER_LEVEL}px;">
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
            left: {WIDTHS.INDENT_PER_LEVEL}px;
            width: {235 - WIDTHS.INDENT_PER_LEVEL * (depth + 1)}px;
            z-index: {depth};
          "
        >
          <Dropzone {...renderDropzone(0)} /> 
        </div>

        {#each taskObj.children as subtaskObj, i (subtaskObj.id)}
          <RecursiveTask 
            taskObj={subtaskObj}
            depth={depth+1}
            {willShowCheckbox}
            ancestorRoomIDs={[taskObj.id, ...ancestorRoomIDs]}
            {isLargeFont}
          /> 

          {#if i === n - 1}
            <!-- notice `left` is a constant, because it'll inherit the parent's cumulative left -->
            <div class="ghost-negative"
              style="
                left: {WIDTHS.INDENT_PER_LEVEL}px;
                width: {235 - WIDTHS.INDENT_PER_LEVEL * (depth + 1)}px;
                z-index: {depth};
              "
            >
              <Dropzone {...renderDropzone(i + 1)} /> 
            </div>
          {:else}
            <div 
              style="
                width: {235 - WIDTHS.INDENT_PER_LEVEL * (depth + 1)}px;
                z-index: {depth};
              "
            >
              <Dropzone {...renderDropzone(i + 1)} /> 
            </div>
          {/if}
        {/each}
      {/if}
    </div>
  {/if}
</div>

<style>
  .task-name {
    min-width: 16px; 
    min-height: 16px;
  }

  .overdue {
    color: red;
  }

  .task-row-container {
    display: flex; 
    align-items: center;
    min-width: 30px; /* min-width and height to make it easy to delete legacy tasks with no titles */
    white-space: nowrap;
    text-overflow: ellipsis;
    color: rgb(80, 80, 80);
  }

  .done-task {
    background: linear-gradient(to right, rgba(76, 175, 80, 0.04), transparent 50%);
    color: #388e3c;
    border-radius: 4px;
    transition: background 0.2s, color 0.2s;
  }
</style> 