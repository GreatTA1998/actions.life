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
  const { indent, scale, rootFontSize, subFontSize } = getContext('list-config')

  let {
    task,
    depth,
    ancestorIDs = [], // ancestorIDs prevent a parent from becoming its own parent, creating an infinite cycle
    verticalTimeline,
    infoBadge
  } = $props()

  let n = $derived(task.children.length)
  const colorForDebugging = getRandomColor()

  function dzProps (i) {
    return {
      ancestorIDs: [task.id, ...ancestorIDs],
      roomsInThisLevel: task.children,
      idxInThisLevel: i,
      parentID: task.id,
      colorForDebugging
    }
  }
</script>

<div class="relative" style="font-weight: {depth === 1 ? 600 : 400}">
  <div draggable="true"
    ondragstart={e => startTaskDrag({ e, id: task.id })}
    style="font-size: {depth === 1 ? rootFontSize() : subFontSize()}"
    class="flexbox items-center min-w-[30px] truncate text-[#1a1a1a] select-none"
  >
    <div class="relative ml-0.5 mr-1">
      {@render verticalTimeline?.()}
      
      <div class="relative py-0.5">
        {#if n === 0}
          <Checkbox value={task.isDone}
            onchange={e => Task.update({
              id: task.id,
              keyValueChanges: { isDone: e.target.checked }
            })}
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

    <button onclick={() => openTaskPopup(task)} 
      class="min-w-[16px] min-h-[16px] truncate" 
      class:done-task={task.isDone}
    >
      {task.name}
    </button>

    <div style="margin-left: 6px;"></div>

    <div class="flexbox items-center gap-x-1">
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
        {#each task.children as subtask, i (subtask.id)}
          <Dropzone {...dzProps(i)} /> 
          
          <RecursiveTask 
            task={subtask}
            depth={depth+1}
            ancestorIDs={[task.id, ...ancestorIDs]}
          /> 
        {/each}

        <Dropzone {...dzProps(n)} 
          extraClass="ghost-negative"
          extraStyle="left: {indent}px; z-index: {depth}; right: 0" 
        />
      {/if}
    </div>
  {/if}
</div>

<style>
  .overdue {
    color: red;
  }

  .done-task {
    background: linear-gradient(to right, rgba(76, 175, 80, 0.04), transparent 50%);
    color: #388e3c;
    border-radius: 4px;
  }
</style> 