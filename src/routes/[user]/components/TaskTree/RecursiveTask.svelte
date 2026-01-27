<script>
  import RecursiveTask from './RecursiveTask.svelte'
  import Dropzone from './Dropzone.svelte'
  import SubtaskCountIndicator from '$lib/components/SubtaskCountIndicator.svelte'
  import Checkbox from '$lib/components/Checkbox.svelte'
  import TimelineRenderer from './TimelineRenderer.svelte'
  import TaskMenu from './TaskMenu.svelte'
  import TaskCaret from './TaskCaret.svelte'
  import MslCalendarTodayOutline from 'virtual:icons/material-symbols-light/calendar-today-outline'
  import { getRandomColor } from '$lib/utils/core.js'
  import { DateTime } from 'luxon'
  import { getContext } from 'svelte'

  const { Task, openTaskPopup } = getContext('app')
  const { startTaskDrag } = getContext('drag-drop')
  const { indent, listWidth, scale, rootFontSize, subFontSize } = getContext('list-config')

  let {
    task,
    depth,
    ancestorIDs = [], // ancestorIDs prevent a parent from becoming its own parent, creating an infinite cycle
    verticalTimeline,
    infoBadge
  } = $props()

  const colorForDebugging = getRandomColor()
  const padding = 6

  let n = $derived(task.children.length)
  let dzWidth = $derived(`calc(${listWidth()} - ${padding}px - ${indent * depth}px)`)

  function handleCheckboxChange (e) {
    Task.update({
      id: task.id,
      keyValueChanges: { isDone: e.target.checked }
    })
  }

  function renderDropzone (idx) {
    return {
      ancestorIDs: [task.id, ...ancestorIDs],
      roomsInThisLevel: task.children,
      idxInThisLevel: idx,
      parentID: task.id,
      colorForDebugging
    }
  }
</script>

<div style="position: relative; width: 100%; font-weight: {depth === 1 ? 600 : 400};">
  <div draggable="true"
    ondragstart={e => startTaskDrag({ e, id: task.id })}
    style="font-size: {depth === 1 ? rootFontSize() : subFontSize()}rem;"
    class="task-row-container select-none"
  >
    <div style="position: relative; margin-left: 2px; margin-right: 4px;">
      {@render verticalTimeline?.()}
      
      <div style="position: relative; padding-top: 2px; padding-bottom: 2px;">
        {#if n === 0}
          <Checkbox value={task.isDone}
            onchange={e => handleCheckboxChange(e)}
            zoom={0.5 * scale()}
          />
        {:else}
          <TaskCaret isCollapsed={task.isCollapsed}
            onToggle={() => Task.update({ id: task.id, keyValueChanges: { isCollapsed: !task.isCollapsed } })}
            zoom={1 * scale()}
          />
        {/if}
      </div>
    </div>

    <button onclick={() => openTaskPopup(task)} class="task-name truncate" class:done-task={task.isDone}>
      {task.name}
    </button>

    <div style="margin-left: 6px;"></div>

    <div style="display: flex; align-items: center; column-gap: 4px;">
      {#if infoBadge}
        {@render infoBadge()}
      {:else if task.startDateISO}
        <div class:overdue={!task.isDone && task.startDateISO < DateTime.now().toFormat('yyyy-MM-dd')} 
          class="flexbox items-center"
        >
          <MslCalendarTodayOutline style="font-size: 0.75rem;"/>
        </div>
      {/if}

      {#if task.isCollapsed && n > 0}
        <SubtaskCountIndicator {task} onclick={() => openTaskPopup(task)} />
      {/if}
    </div>

    <TaskMenu {task} />
  </div>

  {#if task.childrenLayout === 'timeline'}
    <TimelineRenderer
      {task}
      children={task.children}
      parentID={task.id}
      {depth}
      {ancestorIDs}
      {colorForDebugging}
    />
  {:else}
    <div style="margin-left: {indent}px;">
      {#if !task.isCollapsed}
        <Dropzone {...renderDropzone(0)} 
          extraClass={n === 0 ? 'ghost-negative' : ''} 
          extraStyle="left: {indent}px; width: {dzWidth}; z-index: {depth}"
        /> 
        {#each task.children as subtask, i (subtask.id)}
          <RecursiveTask 
            task={subtask}
            depth={depth+1}
            ancestorIDs={[task.id, ...ancestorIDs]}
          /> 
          {#if i === n - 1}
            <Dropzone {...renderDropzone(i + 1)} 
              extraClass="ghost-negative"
              extraStyle="left: {indent}px; width: {dzWidth}; z-index: {depth}"
            /> 
          {:else}
            <Dropzone {...renderDropzone(i + 1)} 
              extraStyle="width: {dzWidth}; z-index: {depth}" 
            /> 
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
    color: #1a1a1a; /* rgb(80, 80, 80) */
  }

  .done-task {
    background: linear-gradient(to right, rgba(76, 175, 80, 0.04), transparent 50%);
    color: #388e3c;
    border-radius: 4px;
  }
</style> 