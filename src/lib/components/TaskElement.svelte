<div class="relative z-0">
  <div 
    {@attach registerDropzone({
      id,
      clipRectFunction: calClipRect,
      ignoreIf: circular,
      onDrop () {
        if (circular()) return
        const rooms = task.children ?? []
        return Task.update({
          id: $draggedItem.id,
          kvChanges: {
            parentID: task.id,
            orderValue: computeOrderValue(rooms.length, rooms),
            onList: true,
            startTime: '',
            startDateISO: ''
          }
        })
      }
    })}
    onclick={() => openTaskPopup(task)}
    onmousedown={e => startMouseDrag({ e, id: task.id, from: 'calendar' })}
    ontouchstart={e => startTouchDrag({ e, id: task.id, from: 'calendar' })}
    class={[calendarBlock, 'relative flex flex-col gap-y-0', 'bg-cover bg-center bg-no-repeat']}
    style={`
      height: ${height}px;
      background-color: rgba(255, 255, 255, 0.4);
      border: ${task.imageDownloadURL ? '' : '1px solid rgb(0, 0, 0, 0.1)'};
      ${$bestDropzoneID === id ? (circular() ? 'background-color: red;' : dropPreviewCSS) : ''}
    `}
    style:background-image={hasIntersected && task.imageDownloadURL ? `url(${task.imageDownloadURL})` : 'none'}
    use:lazyCallable={() => hasIntersected = true}
  >
    <div class="shrink-0"
      style:padding="var(--left-padding)"
      style:border-radius="var(--left-padding)"
      style:background={task.imageDownloadURL ? `linear-gradient(${COLORS.OVERLAY_DARKEST}, transparent)` : ''}
    >
      <CalTaskUnit {task} color={task.imageDownloadURL ? 'white' : 'var(--task-name-color)'}
        onNameFontSize={measureNameFontSize}
      >
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
      <div class="shrink-0"
        style:padding="0 var(--left-padding) 0 calc(var(--left-padding) + {titleFS})"
        onclick={e => e.stopPropagation()}
        onmousedown={e => e.stopPropagation()}
        ontouchstart={e => e.stopPropagation()}
      >
        <TodoList
          trees={nestedTasks}
          listWidth="100%"
          parentID={task.id}
          indent="0.75rem"
          rootFontSize={notesFS}
          subFontSize={notesFS}
          startDepth={2}
          rootDropzoneHeight="0.25rem"
          subDropzoneHeight="0.25rem"
          clipRectFunction={calClipRect}
          unscheduleOnDrop
          from="event"
        />
      </div>
    {/if}
  </div>

  <!-- absolutely positioned -->
  <DurationAdjuster {task} {minDuration}
    onChange={newVal => previewDuration = newVal}
    onInput={async () => {
      Task.update({ 
        id: task.id, 
        kvChanges: { duration: Math.max(minDuration, snap(previewDuration, $calSnapInterval)) } 
      })
      // let snapshot listener resolve via 1 macrotask, so there is no flash of height change between previewDuration and task.duration
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
  import { calendarBlock, titleFS, notesFS } from '$lib/styles/reused.module.css'
  import { pixelsPerHour, timestampsColumnWidth, headerHeight } from '/src/routes/[user]/components/Calendar/store.js'
  import { getContext } from 'svelte'
  
  const { Task, treesByID } = getContext('app')
  const { openTaskPopup } = getContext('task-popup')
  const { 
    startMouseDrag, startTouchDrag, registerDropzone, draggedItem,
    bestDropzoneID, dropPreviewCSS, scrollCalRect, computeOrderValue
  } = getContext('drag-drop')

  let { task = null } = $props() // assumes `task` is hydrated
  
  const id = randomID()
  let previewDuration = $state(0)
  let nameFontSizePx = $state(0)
  let minDuration = $derived(nameFontSizePx / ($pixelsPerHour / 60) || 1)
  let height = $derived((previewDuration || task.duration) * $pixelsPerHour / 60)
  let hasIntersected = $state(false)
  let nestedTasks = $derived(
    [...(task.children ?? [])]
      .sort((a, b) => a.orderValue - b.orderValue)
  )

  function measureNameFontSize (node) {
    nameFontSizePx = parseFloat(getComputedStyle(node).fontSize)
  }

  function calClipRect () {
    const { left, right, top, bottom } = $scrollCalRect()
    return {
      left: left + $timestampsColumnWidth,
      right,
      top: top + $headerHeight,
      bottom
    }
  }

  function circular () {
    if ($draggedItem.id === task.id) return true
    let node = $treesByID[task.id] ?? task
    const seen = new Set()
    while (node?.parentID) {
      if (node.parentID === $draggedItem.id) return true
      if (seen.has(node.id)) break
      seen.add(node.id)
      node = $treesByID[node.parentID]
    }
    return false
  }
</script>
