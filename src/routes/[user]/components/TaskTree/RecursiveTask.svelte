<script>
  import RecursiveTask from './RecursiveTask.svelte'
  import Dropzone from './Dropzone.svelte'
  import SubtaskCountIndicator from '$lib/components/SubtaskCountIndicator.svelte'
  import Checkbox from '$lib/components/Checkbox.svelte'
  import Timeline from './Timeline.svelte'
  import TaskMenu from './TaskMenu.svelte'
  import MslCalendarTodayOutline from 'virtual:icons/material-symbols-light/calendar-today-outline'
  import { user } from '$lib/store'
  import { getRandomColor, randomID } from '$lib/utils/core.js'
  import { DateTime } from 'luxon'
  import { getContext } from 'svelte'

  const { Task, openTaskPopup } = getContext('app')
  const { 
    registerDropzone, 
    startTaskDrag, draggedItem, logicAreaRect, 
    bestDropzoneID,  dropPreviewCSS, computeOrderValue
   } = getContext('drag-drop')
  const { indent, rootFontSize, subFontSize, debug } = getContext('list-config')

  let {
    task,
    depth,
    ancestorIDs = [],
    verticalTimeline,
    infoBadge
  } = $props()

  const id = randomID()
  let circular = $derived([task.id, ...ancestorIDs].includes($draggedItem.id))

  let n = $derived(task.children.length)
  let fontSize = $derived(depth === 1 ? rootFontSize() : subFontSize())
  let overdue = $derived(!task.isDone && task.startDateISO < DateTime.now().toFormat('yyyy-MM-dd'))
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

<div class="relative" style:border="{debug() ? 1 : 0}px solid {debugColor}">
  <div draggable="true"
    {@attach registerDropzone({ 
      id, 
      clipRectFunction: $logicAreaRect,
      onDrop () {
        if (circular) return 

        Task.update({ 
          id: $draggedItem.id,
          kvChanges: {
            parentID: task.id,
            orderValue: computeOrderValue(0, task.children),
            onList: true
          }
        })
      }
    })}
    ondragstart={e => startTaskDrag({ e, id: task.id })}
    style:font-size={fontSize}
    style:--task-control-width={fontSize}
    style="{$bestDropzoneID === id ? (circular ? 'background-color: red;' : dropPreviewCSS) : ''}"
    class="
      flex flex-col
      text-[#1a1a1a] select-none
      px-[var(--left-padding)] rounded-[var(--left-padding)]
    "
  >
    <div class="flex items-center gap-x-1">
      <div class="shrink-0 relative">
        {@render verticalTimeline?.()}
        
        <Checkbox value={task.isDone} {fontSize}
          onchange={e => Task.update({ id: task.id, 
            kvChanges: { isDone: e.target.checked }
          })}
        />
      </div>

      <button onclick={() => openTaskPopup(task)} 
        class="shrink-1 min-w-[1ch] min-h-[24px] text-left flex leading-[1.25]"
        class:done-task={task.isDone}
        style:font-weight={depth === 1 ? 600 : 400}
      >
        <span class="truncate text-clip">
          {task.name}
        </span>
      </button>

      {#if task.tagIDs}
        {#each task.tagIDs as tagID (tagID)}
          <div class="shrink-0 w-[5px] h-[5px] rounded-[50%]" 
            style:background-color={$user.tags?.[tagID]?.color}
          >
          </div>
        {/each}
      {/if}
        
      {#if infoBadge}
        {@render infoBadge()}
      {:else if task.startDateISO}
        <div class="flex items-center min-h-[24px]" style:color={overdue ? 'red' : ''}>
          <MslCalendarTodayOutline style="font-size: 0.75rem"/>
        </div>
      {/if}

      {#if n > 0}
        <SubtaskCountIndicator extraClass="min-w-fit"       
          {task} {fontSize}
          onclick={() => 
            document.startViewTransition(() => {
              Task.update({ 
                id: task.id, 
                kvChanges: { isCollapsed: !task.isCollapsed } 
              })
            })
          } 
        />
      {/if}
      
      <TaskMenu {task} {fontSize} 
        extraClass="shrink-0"
      />
    </div>

    {#if task.notes}
      <button onclick={() => openTaskPopup(task)}
        class="
          ml-[calc(var(--task-control-width)+0.25rem)] text-left text-[0.72em] text-[#6f6f6f] leading-[1.25]
          max-w-[45ch] line-clamp-2
        "
      >
        {task.notes}
      </button>
    {/if}
  </div>

  <div style:margin-left={indent()}>
    {#if !task.isCollapsed}
      {#if task.childrenLayout === 'timeline'}
        <Timeline children={task.children}
          parentID={task.id}
          {depth}
          {ancestorIDs}
        />
      {:else}
        {#each task.children as subtask, i (subtask.id)}
          <Dropzone {...dzProps(i)} /> 
          
          <RecursiveTask 
            task={subtask}
            depth={depth+1}
            ancestorIDs={[task.id, ...ancestorIDs]}
          /> 
        {/each}
      {/if}

      <Dropzone {...dzProps(n)} 
        extraClass="ghost-negative"
        extraStyle="left: {indent()}; right: 0; z-index: {depth}" 
      />
    {/if}
  </div>
</div>

<style>
  :global(.ghost-negative) {
    position: absolute;
    bottom: calc(-1 * var(--heights-sub-dropzone))
  }
  
  .done-task {
    background: linear-gradient(to right, rgba(76, 175, 80, 0.04), transparent 50%);
    color: #388e3c;
    border-radius: 4px;
  }
</style> 