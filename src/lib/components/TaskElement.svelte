<div class="relative z-0">
  <div 
    {@attach registerDropzone({
      clipRectFunction () {
        const { left, right, top, bottom } = $scrollCalRect()
        return {
          left: left + $timestampsColumnWidth, // potentially brittle for mobile mode
          right,
          top: top + $headerHeight,
          bottom
        }
      },
      id: dropzoneID,
      ignoreIf: circular,
      onDrop () {
        if (circular()) return
        return Task.update({
          id: $draggedItem.id,
          kvChanges: {
            parentID: task.id
          }
        })
      },
      normalizeDragItemHeight: true
    })}
    onclick={() => openTaskPopup(task)}
    onmousedown={e => startMouseDrag({ e, id: task.id })}
    ontouchstart={e => startTouchDrag({ e, id: task.id })}
    class={[
      'relative flex flex-col gap-y-0',
      'bg-cover bg-center bg-no-repeat',
      calendarBlock
    ]}
    style="
      height: {height}px;
      background-color: rgba(255, 255, 255, 0.4);
      border: {task.imageDownloadURL ? '' : '1px solid rgb(0, 0, 0, 0.1)'};
      {$bestDropzoneID === dropzoneID ? (circular() ? 'background-color: red;' : dropPreviewCSS) : ''}
    "
    style:background-image={hasIntersected && task.imageDownloadURL
      ? `url(${task.imageDownloadURL})`
      : 'none'}
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
      
    <div class="grow-1 overflow-hidden" 
      style:padding="0 var(--left-padding)"
    >
      <div style="
        color: {task.imageDownloadURL ? 'white' : 'oklch(43.9% 0 0)'};"
        class="text-xs"
      >
        {task.notes}
      </div>

      {#if task.children}
        <TodoList listWidth="100%" trees={task.children}>
          
        </TodoList>
      {/if}
    </div>
  </div>

  <!-- absolutely positioned -->
  <DurationAdjuster {task} 
    onChange={newVal => previewDuration = newVal}
    onInput={async () => {
      Task.update({ 
        id: task.id, 
        kvChanges: { duration: snap(previewDuration, $calSnapInterval) } 
      })
      // let snapshot listener resolve via 1 macrotask, so there is no flash of height change between previewDuration and task.duration
      setTimeout(() => previewDuration = 0, 0)
    }}
  />
</div>

<script>
  import TodoList from '/src/routes/[user]/components/ListsArea/TodoList.svelte'
  import DurationAdjuster from '$lib/components/DurationAdjuster.svelte'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import CalTaskUnit from '$lib/components/CalTaskUnit.svelte'
  import { COLORS } from '$lib/utils/constants.js'
  import { snap } from '$lib/utils/core.js'
  import { calSnapInterval } from '$lib/store'
  import { lazyCallable } from '$lib/utils/svelteActions.js'
  import { calendarBlock, titleFS } from '$lib/styles/reused.module.css'
  import { pixelsPerHour, headerHeight, timestampsColumnWidth  } from '/src/routes/[user]/components/Calendar/store.js'
  import { getContext } from 'svelte'
  
  const { Task, treesByID } = getContext('app')
  const { openTaskPopup } = getContext('task-popup')
  const { 
    startMouseDrag, startTouchDrag, registerDropzone, scrollCalRect,
    bestDropzoneID, dropPreviewCSS, draggedItem
  } = getContext('drag-drop')

  let { task = null } = $props() // assumes `task` is hydrated
  
  let previewDuration = $state(0)
  let height = $derived((previewDuration || task.duration) * $pixelsPerHour / 60)
  let hasIntersected = $state(false)
  const dropzoneID = $derived(`--task-element-${task.id}`)

  function circular () {
    if ($draggedItem.id === task.id) return true
    let node = $treesByID[task.id] ?? task
    const seen = new Set()
    while (node.parentID) {
      if (node.parentID === $draggedItem.id) return true
      if (seen.has(node.id)) break
      seen.add(node.id)
      node = $treesByID[node.parentID]
    }
    return false
  }
</script>