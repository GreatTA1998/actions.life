<script>
  import RecursiveTask from './RecursiveTask.svelte'
  import Dropzone from './Dropzone.svelte'
  import SubtaskCountIndicator from '$lib/components/SubtaskCountIndicator.svelte'
  import Checkbox from '$lib/components/Checkbox.svelte'
  import TimelineRenderer from './TimelineRenderer.svelte'
  import TaskMenu from './TaskMenu.svelte'
  import TaskCaret from './TaskCaret.svelte'
  import MslCalendarTodayOutline from 'virtual:icons/material-symbols-light/calendar-today-outline'
  import { user } from '$lib/store'
  import { getRandomColor } from '$lib/utils/core.js'
  import { DateTime } from 'luxon'
  import { getContext } from 'svelte'

  const { Task, openTaskPopup } = getContext('app')
  const { startTaskDrag } = getContext('drag-drop')
  const { indent, scale, rootFontSize, subFontSize, debug } = getContext('list-config')

  let {
    task,
    depth,
    ancestorIDs = [], // ancestorIDs prevent a parent from becoming its own parent, creating an infinite cycle
    verticalTimeline,
    infoBadge
  } = $props()

  let n = $derived(task.children.length)
  let fontSize = $derived(depth === 1 ? rootFontSize() : subFontSize())
  const debugColor = getRandomColor()

  function dzProps (i) {
    return {
      ancestorIDs: [task.id, ...ancestorIDs],
      roomsInThisLevel: task.children,
      idxInThisLevel: i,
      parentID: task.id,
      debugColor
    }
  }
</script>

<div class="relative" 
  style:border="{debug() ? 1 : 0}px solid {debugColor}"
  style:font-weight={depth === 1 ? 600 : 400}
>
  <div 
    draggable="true" ondragstart={e => startTaskDrag({ e, id: task.id })}
    style:font-size={fontSize}
    class="flex items-center gap-x-1 text-[#1a1a1a] select-none"
  >
    <div class="shrink-0 relative">
      {@render verticalTimeline?.()}
      
      {#if n === 0}
        <Checkbox value={task.isDone} {fontSize}
          onchange={e => Task.update({ id: task.id, keyValueChanges: { isDone: e.target.checked }})}
        />
      {:else}
        <TaskCaret isCollapsed={task.isCollapsed} {fontSize}
          onToggle={() => Task.update({ id: task.id, keyValueChanges: { isCollapsed: !task.isCollapsed } })}
        />
      {/if}
    </div>

    <button onclick={() => openTaskPopup(task)} 
      class="min-w-[16px] min-h-[16px] truncate text-clip shrink-1" 
      class:done-task={task.isDone}
    >
      {task.name}
    </button>

    <div class="shrink-0 flex items-center gap-x-1">
      {#if task.tagIDs}
        {#each task.tagIDs as tagID}
          <div style="background-color: {$user.tags?.[tagID]?.color}; border-radius: 50%; width: 5px; height: 5px;"></div>
        {/each}
      {/if}
       
      {#if infoBadge}
        {@render infoBadge()}
      {:else if task.startDateISO}
        <div class="flex items-center"
          class:overdue={!task.isDone && task.startDateISO < DateTime.now().toFormat('yyyy-MM-dd')} 
        >
          <MslCalendarTodayOutline style="font-size: 0.75rem;"/>
        </div>
      {/if}

      {#if task.isCollapsed && n > 0}
        <SubtaskCountIndicator {task} onclick={() => openTaskPopup(task)} />
      {/if}
    </div>
    
    <TaskMenu {task} extraClass="shrink-0"/>
  </div>

  {#if task.childrenLayout === 'timeline'}
    <TimelineRenderer
      {task}
      children={task.children}
      parentID={task.id}
      {depth}
      {ancestorIDs}
      {debugColor}
    />
  {:else}
    <div style="margin-left: {indent()}">
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
          extraStyle="left: {indent()}; right: 0; z-index: {depth}" 
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