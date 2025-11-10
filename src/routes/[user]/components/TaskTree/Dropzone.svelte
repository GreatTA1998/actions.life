<div 
  bind:this={dropzoneElem}
  onclick={() => activateInput({
    anchorID,
    modifiers: {
      persistsOnList: true,
      orderValue: computeOrderValue(),
      parentID
    }
  })}
  id={anchorID}
  style="
    anchor-name: {anchorID};
    height: {remHeight}rem; 
    border-radius: var(--left-padding);
    border: 1px solid {colorForDebugging}; 
    {$bestDropzoneID === dropzoneID ? dropPreviewCSS() : ''}
    {$bestDropzoneID === dropzoneID && isInvalidDrop ? 'background-color: red;' : ''}
  "
></div>

<script>
  import { activateInput } from '$lib/store/popoverInput.js'
  import { isOverlapping, getOverlapArea, clip } from '$lib/utils/dragDrop.js'
  import { HEIGHTS } from '$lib/utils/constants.js'
  import { getRandomID } from '$lib/utils/core.js'
  import { dropPreviewCSS } from '$lib/utils/dragDrop.js'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')
  const { draggedItem, hasDropped, matchedDropzones, bestDropzoneID, logicAreaRect, resetDragDrop } = getContext('drag-drop')
  const { isLargeFont } = getContext('list')

  let {
    ancestorRoomIDs,
    roomsInThisLevel,
    idxInThisLevel,
    parentID = '',
    colorForDebugging = 'red',
    remHeight = HEIGHTS.SUB_DROPZONE * ($isLargeFont ? 2 : 1)
  } = $props()

  let dropzoneElem = $state(null)
  let n = $derived(roomsInThisLevel.length)
  let anchorID = $derived(`--dropzone-${dropzoneID}`)
  let intersecting = $state(false)
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