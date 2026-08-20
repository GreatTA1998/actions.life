<div class="relative z-0">
  <div 
    data-task-id={task.id}
    {@attach registerDropzone({
      id,
      clipRectFunction: calClipRect,
      ignoreIf: cycle,
      onDrop () {
        const rooms = task.children ?? []
        return placeOnList({ parentID: task.id, rooms, index: rooms.length, unschedule: true })
      }
    })}
    onclick={() => openTaskPopup(task)}
    onmousedown={e => startMouseDrag({ e, id: task.id })}
    ontouchstart={e => startTouchDrag({ e, id: task.id })}
    class={[calendarBlock, 'relative overflow-hidden', 'bg-cover bg-center bg-no-repeat']}
    style={`
      height: ${height}px;
      background-color: rgba(255, 255, 255, 0.4);
      border: ${task.imageDownloadURL ? '' : '1px solid rgb(0, 0, 0, 0.1)'};
      ${$bestDropzoneID === id ? dropPreviewCSS : ''}
    `}
    style:min-height={`calc(${titleFS} + var(--left-padding) * 2)`}
    style:background-image={hasIntersected && task.imageDownloadURL ? `url(${task.imageDownloadURL})` : 'none'}
    use:lazyCallable={() => hasIntersected = true}
  >
    <div class="shrink-0"
      style:padding="var(--left-padding)"
      style:border-radius="var(--left-padding)"
      style:background={task.imageDownloadURL ? `linear-gradient(${COLORS.OVERLAY_DARKEST}, transparent)` : ''}
    >
      <CalTaskUnit {task} color={task.imageDownloadURL ? 'white' : 'var(--task-name-color)'}>
        {#snippet icon ()}
          <DoodleIcon 
            iconTask={task} 
            size={titleFS} 
            whiteVariant={task.imageDownloadURL}
            scaleToFit 
          />
        {/snippet}
      </CalTaskUnit>
    </div>
      
    {#if task.notes}
      <div class="overflow-hidden" style:padding="0 var(--left-padding)">
        <div style="
          color: {task.imageDownloadURL ? 'white' : 'oklch(43.9% 0 0)'};"
          class="text-xs"
        >
          {task.notes}
        </div>
      </div>
    {/if}

    {#if nestedTasks.length}
      <div
        class="overflow-hidden pointer-events-none"
        data-drag-origin="nested-cal"
        style:padding="0 var(--left-padding)"
      >
        <TodoList
          trees={nestedTasks}
          parentID={task.id}
          compact
          listWidth="fit-content"
          clipRectFunction={calClipRect}
        />
      </div>
    {/if}
  </div>

  <DurationAdjuster {task}
    onChange={newVal => previewDuration = newVal}
    onInput={async () => {
      Task.update({ 
        id: task.id, 
        kvChanges: { duration: snap(previewDuration, $calSnapInterval) } 
      })
      setTimeout(() => previewDuration = 0, 0)
    }}
  />
</div>

<script>
  import DurationAdjuster from '$lib/components/DurationAdjuster.svelte'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import CalTaskUnit from '$lib/components/CalTaskUnit.svelte'
  import TodoList from '/src/routes/[user]/components/ListsArea/TodoList.svelte'
  import { COLORS } from '$lib/utils/constants.js'
  import { snap, randomID } from '$lib/utils/core.js'
  import { calSnapInterval } from '$lib/store'
  import { lazyCallable } from '$lib/utils/svelteActions.js'
  import { calendarBlock, titleFS } from '$lib/styles/reused.module.css'
  import { pixelsPerHour, timestampsColumnWidth, headerHeight, calBodyClip } from '/src/routes/[user]/components/Calendar/store.js'
  import { getContext } from 'svelte'
  
  const { Task, treesByID } = getContext('app')
  const { openTaskPopup } = getContext('task-popup')
  const { 
    startMouseDrag, startTouchDrag, registerDropzone, draggedItem,
    bestDropzoneID, dropPreviewCSS, scrollCalRect, placeOnList
  } = getContext('drag-drop')

  let { task = null } = $props()
  
  const id = randomID()
  let previewDuration = $state(0)
  let height = $derived((previewDuration || task.duration) * $pixelsPerHour / 60)
  let hasIntersected = $state(false)
  let nestedTasks = $derived(
    [...(task.children ?? [])].sort((a, b) => a.orderValue - b.orderValue)
  )

  function calClipRect () {
    return calBodyClip($scrollCalRect(), $timestampsColumnWidth, $headerHeight)
  }

  function cycle () {
    const seen = new Set()
    let node = $treesByID[task.id]
    while (node) {
      if (node.id === $draggedItem.id || node.parentID === $draggedItem.id) return true
      if (seen.has(node.id)) break
      seen.add(node.id)
      node = $treesByID[node.parentID]
    }
    return false
  }
</script>
