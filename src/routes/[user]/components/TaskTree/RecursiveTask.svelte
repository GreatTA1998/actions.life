<script>
  import RecursiveTask from './RecursiveTask.svelte'
  import Dropzone from './Dropzone.svelte'
  import SubtaskCollapseIndicator from '$lib/components/SubtaskCollapseIndicator.svelte'
  import Checkbox from '$lib/components/Checkbox.svelte'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import Timeline from './Timeline.svelte'
  import TaskMenu from './TaskMenu.svelte'
  import MslCalendarTodayOutline from 'virtual:icons/material-symbols-light/calendar-today-outline'
  import { user } from '$lib/store'
  import { getRandomColor, randomID } from '$lib/utils/core.js'
  import { DateTime } from 'luxon'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')
  const { openTaskPopup } = getContext('task-popup')
  const { 
    registerDropzone, 
    startMouseDrag, startTouchDrag, 
    bestDropzoneID, dropPreviewCSS, placeOnList
   } = getContext('drag-drop')
  const { indent, rootFontSize, subFontSize, debug, clipRectFunction } = getContext('list-config')

  let {
    task,
    depth,
    verticalTimeline,
    infoBadge
  } = $props()

  const id = randomID()

  let n = $derived(task.children.length)
  let fontSize = $derived(depth === 1 ? rootFontSize() : subFontSize())
  let overdue = $derived(!task.isDone && task.startDateISO < DateTime.now().toFormat('yyyy-MM-dd'))
  const debugColor = getRandomColor()

  function dzProps (i) {
    return {
      roomsInThisLevel: task.children,
      idxInThisLevel: i,
      parentID: task.id,
      debugColor
    }
  }
</script>

<div class="relative" data-task-id={task.id} style:border="{debug() ? 1 : 0}px solid {debugColor}">
  <div
    {@attach registerDropzone({ 
      id, 
      clipRectFunction: clipRectFunction(),
      onDrop: () => placeOnList({ parentID: task.id, rooms: task.children, index: 0 })
    })}
    onmousedown={e => startMouseDrag({ e, id: task.id })}
    ontouchstart={e => startTouchDrag({ e, id: task.id })}
    style:font-size={fontSize}
    style:--task-control-width={fontSize}
    style="{$bestDropzoneID === id ? dropPreviewCSS : ''}"
    style:border-radius="var(--left-padding)"
    class="flex flex-col select-none px-[var(--left-padding)] text-[#1a1a1a]"
  >
    <div class="flex items-center gap-x-1">
      <div class="shrink-0 relative">
        {@render verticalTimeline?.()}
        
        {#if task.iconURL}
          <DoodleIcon iconTask={task} size={fontSize} scaleToFit />
        {:else}
          <Checkbox value={task.isDone} {fontSize}
            onchange={e => Task.update({ id: task.id, 
              kvChanges: { isDone: e.target.checked }
            })}
          />
        {/if}
      </div>

      <button onclick={() => openTaskPopup(task)}
        style:color="var(--task-name-color)"
        class="shrink-1 min-w-[1ch] min-h-4 text-left flex leading-[1.25]"
        style:font-weight={depth === 1 ? 600 : 400}
      >
        <span class="truncate text-clip">
          {task.name}
        </span>
      </button>

      {#if task.imageDownloadURL}
        <img onclick={() => openTaskPopup(task)} src={task.imageDownloadURL} class="w-auto shrink-0 rounded-sm" style:height="1lh">
      {/if}

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
        <div onclick={() => openTaskPopup(task)} class="flex items-center shrink-0" style:color={overdue ? 'red' : 'var(--fine-control-color)'}>
          <MslCalendarTodayOutline class="shrink-0" style="width: 0.75rem; height: 0.75rem"/>
        </div>
      {/if}

      {#if n > 0}
        <SubtaskCollapseIndicator extraClass="min-w-fit"
          {task} {fontSize} collapsed={task.isCollapsed}
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
      
      <TaskMenu {task} {fontSize} color="var(--fine-control-color)"
        extraClass="shrink-0"
      />
    </div>

    {#if task.notes}
      <button onclick={() => openTaskPopup(task)}
        style:margin-left="calc(var(--task-control-width) + 0.25rem)"
        class="text-left text-xs leading-[1.25] max-w-[45ch]"
        style:color="oklch(43.9% 0 0)"
      >
        <span class="grow-1 line-clamp-2">
          {task.notes}
        </span>
      </button>
    {/if}
  </div>

  <div style:margin-left={indent()}>
    {#if !task.isCollapsed}
      {#if task.childrenLayout === 'timeline'}
        <Timeline children={task.children}
          parentID={task.id}
          {depth}
        />
      {:else}
        {#each task.children as subtask, i (subtask.id)}
          <Dropzone {...dzProps(i)} /> 
          
          <RecursiveTask 
            task={subtask}
            depth={depth+1}
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
</style>
