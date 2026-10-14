<div class="relative z-0">
  <div 
    data-task-id={task.id}
    {@attach registerDropzone({
      id,
      clipRectFunction: calClipRect,
      ignoreIf: cycle,
      onDrop () {
        return placeInTaskElement({
          parentID: task.id,
          rooms: task.children,
          index: task.children.length
        })
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
      <CalTaskUnit {task} color={task.imageDownloadURL ? 'white' : 'var(--task-name-color)'} />
    </div>

    {#if task.notes}
      <div class="overflow-hidden" style:padding="0 var(--left-padding)">
        <div
          class="text-xs"
          style:color={task.imageDownloadURL ? 'white' : 'var(--task-name-color)'}
        >
          {task.notes}
        </div>
      </div>
    {/if}

    {#if task.children.length}
      <div
        class="overflow-hidden pointer-events-none"
        style:padding="0 var(--left-padding)"
        onclick={e => e.stopPropagation()}
        onmousedown={e => e.stopPropagation()}
        ontouchstart={e => e.stopPropagation()}
      >
        <CompactList
          tasks={task.children}
          onReorder={index => placeInTaskElement({ parentID: task.id, rooms: task.children, index })}
          clipRectFunction={calClipRect}
          dragOrigin="nested-cal"
          fontSize={notesFS}
          rowClass="w-fit"
          showChildren
        >
          {#snippet details (child)}
            <button onclick={() => openTaskPopup(child)} class="max-w-[45ch] justify-start text-left text-xs leading-[1.25] text-neutral-600">
              <span class="line-clamp-2">{child.notes}</span>
            </button>
          {/snippet}
        </CompactList>
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
  import CalTaskUnit from '$lib/components/CalTaskUnit.svelte'
  import CompactList from '/src/routes/[user]/components/Calendar/CompactList.svelte'
  import { COLORS } from '$lib/utils/constants.js'
  import { snap, randomID } from '$lib/utils/core.js'
  import { calSnapInterval } from '$lib/store'
  import { lazyCallable } from '$lib/utils/svelteActions.js'
  import { calendarBlock, notesFS, titleFS } from '$lib/styles/reused.module.css'
  import { pixelsPerHour, timestampsColumnWidth, headerHeight, calBodyClip } from '/src/routes/[user]/components/Calendar/store.js'
  import { getContext } from 'svelte'
  
  const { Task, treesByID } = getContext('app')
  const { openTaskPopup } = getContext('task-popup')
  const { 
    startMouseDrag, startTouchDrag, registerDropzone, draggedItem,
    bestDropzoneID, dropPreviewCSS, scrollCalRect, placeInTaskElement
  } = getContext('drag-drop')

  let { task = null } = $props()
  
  const id = randomID()
  let previewDuration = $state(0)
  let height = $derived((previewDuration || task.duration) * $pixelsPerHour / 60)
  let hasIntersected = $state(false)

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
