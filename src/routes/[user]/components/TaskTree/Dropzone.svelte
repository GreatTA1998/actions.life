{#if clicked}
  <div style="height: {heightInPx + 4}px;">
    <MyInput value={taskName}
      oninput={e => taskName = e.target.value}
      onfocusout={() => {
        if (taskName === '') {
          clicked = false
        }
      }}
      onEnterPress={createTask}
      fontSize="{heightInPx * 3/4}px"
      width="100%"
    />
  </div>
{:else}
  <div 
    onclick={e => {
      e.stopPropagation(); 
      clicked = true;
    }}
    bind:this={dropzoneElem} 
    class:highlight={$bestDropzoneID === dropzoneID}
    class:error={$bestDropzoneID === dropzoneID && isInvalidDrop}
    style="
      height: {heightInPx}px; 
      border-radius: var(--left-padding); 
      outline: 0px solid {colorForDebugging}; 
      cursor: pointer;
    "
  ></div>
{/if}

<script>
  import MyInput from '$lib/components/MyInput.svelte'
  import { isOverlapping, getOverlapArea, clip } from '$lib/utils/dragDrop.js'
  import { HEIGHTS } from '$lib/utils/constants.js'
  import { getRandomID } from '$lib/utils/core.js'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')
  const { draggedItem, hasDropped, matchedDropzones, bestDropzoneID, logicAreaRect, resetDragDrop } = getContext('drag-drop')

  let {
    ancestorRoomIDs,
    roomsInThisLevel,
    idxInThisLevel,
    parentID = '',
    colorForDebugging = 'red',
    heightInPx = HEIGHTS.SUB_DROPZONE
  } = $props()

  let dropzoneElem = $state(null)
  let n = $derived(roomsInThisLevel.length)
  let intersecting = $state(false)
  let clicked = $state(false)
  let taskName = $state('')
  const dropzoneID = getRandomID()

  let isInvalidDrop = $derived(ancestorRoomIDs.includes($draggedItem.id))

  $effect(() => {
    if ($draggedItem && dropzoneElem) {
      checkIntersection(
        $logicAreaRect() ? clip($draggedItem, $logicAreaRect()) : $draggedItem // quickfix as we don't have a common container between desktop mode and mobile mode
      )
    }
  })

  $effect(() => {
    if ($hasDropped && $bestDropzoneID === dropzoneID) {
      onReorderDrop()
    }
  })

  function createTask () {
    if (taskName !== '') {
      Task.create({ id: getRandomID(), newTaskObj: {
        name: taskName,
        orderValue: computeOrderValue(),
        parentID
      }})
      taskName = ''
    }
    clicked = false
  }

  function checkIntersection ({ x1, x2, y1, y2 }) {
    const dropzoneRect = dropzoneElem.getBoundingClientRect()
    const overlapping = isOverlapping({ x1, x2, y1, y2 }, dropzoneRect, 0, 0)

    // x1 comparison is an attempt to allow the user to specifically target nested dropzones
    // document this change - the fact that left takes priority, but otherwise normal intersection should still work
    // which makes it very easy for light users to use drag-drop but opens a door for advanced users
    intersecting = overlapping // && x1 > dropzoneRect.left // rename to `qualify` or something
    
    if (intersecting) {
      const area = getOverlapArea({ x1, x2, y1, y2 }, dropzoneRect)
      matchedDropzones.update(obj => {
        obj[dropzoneID] = {
          area,
          left: dropzoneRect.left
        }
        return obj
      })
    }
    else {
      matchedDropzones.update(obj => {
        delete obj[dropzoneID]
        return obj
      })
    }
  }
 
  async function onReorderDrop () {
    dropzoneElem.style.background = ''

    if (isInvalidDrop) {
      resetDragDrop()
      return
    }
    
    const invalids = roomsInThisLevel.filter(task => !task.orderValue)
    if (invalids.length > 0) {
      const errorMessage = `${invalids.length} of the task(s) in the target list has no proper orderValue, aborting drop operation and sending error to the developer`
      alert(errorMessage)
      resetDragDrop()
      throw new Error(errorMessage) // triggers window.onunhandledrejection which emails me
    }

    const keyValueChanges = {
      parentID,
      orderValue: computeOrderValue(),
      persistsOnList: true, // non-persistent rooms, once dragged to the list, becomes persistent. very important, otherwise any node could disappear from the complex task structure just because it's scheduled, some day.
      isArchived: false // otherwise dragging an archived calendar task to the list will cause it to disappear completely
    }

    if ($draggedItem.isFromCal) {
      keyValueChanges.startTime = ''
      keyValueChanges.startDateISO = ''
    }
    
    Task.update({ 
      id: $draggedItem.id, 
      keyValueChanges
    })

    resetDragDrop()
  }

  function computeOrderValue () {
    const k = 1
    const i = idxInThisLevel
    const rooms = roomsInThisLevel

    let newVal
    if (i === 0) {
      const top = rooms[0]
      if (top) newVal = top.orderValue / 1.1 // 1.1 slows down the approach to 0
      else newVal = k // you're dragging a new subtask into a parent that previously had ZERO children, which is valid
    }
    else if (i === n) {
      const bottom = rooms[n-1] 
      newVal = bottom.orderValue + k // Task.js will handle `maxOrderValue`
    }
    else {
      const above = rooms[i-1]
      const below = rooms[i]
      newVal = (above.orderValue + below.orderValue) / 2
    }
    return newVal
  }
</script>

<style>
  .highlight {
    background-color: rgb(87, 172, 247);
  }

  .error {
    background-color: red;
  }
</style>