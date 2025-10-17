<div
  bind:this={ReorderDropzone} 
  style="
    height: {heightInPx}px; 
    border-radius: var(--left-padding); 
    outline: 1px solid {colorForDebugging};
    {$bestDropzoneID === dropzoneID ? dropPreviewCSS() : ''}
    {$bestDropzoneID === dropzoneID && isInvalidDrop ? 'background-color: red;' : ''}
  " 
></div>

<script>
  import { isOverlapping, getOverlapArea, clip } from '$lib/utils/dragDrop.js'
  import { writeBatch } from 'firebase/firestore'
  import { db } from '$lib/db/init'
  import { HEIGHTS } from '$lib/utils/constants.js'
  import { getRandomID } from '$lib/utils/core.js'
  import { dropPreviewCSS } from '$lib/utils/dragDrop.js'
  import { getContext } from 'svelte'

  const { 
    Task, 
    User, user 
  } = getContext('app')
  
  const { 
    draggedItem, hasDropped, matchedDropzones, 
    bestDropzoneID, logicAreaRect, resetDragDrop 
  } = getContext('drag-drop')

  let {
    ancestorRoomIDs,
    roomsInThisLevel,
    idxInThisLevel,
    parentID = '',
    colorForDebugging = 'red',
    heightInPx = HEIGHTS.SUB_DROPZONE
  } = $props()

  let ReorderDropzone = $state(null)
  let batch = writeBatch(db)
  let n = $derived(roomsInThisLevel.length)
  let intersecting = $state(false)

  const dropzoneID = getRandomID()

  let isInvalidDrop = $derived(ancestorRoomIDs.includes($draggedItem.id))

  $effect(() => {
    if ($draggedItem) {
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
    const dropzoneRect = ReorderDropzone.getBoundingClientRect()
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

    batch = writeBatch(db)

    const GAP = 1
    let newVal 

    const dropZoneIdx = idxInThisLevel
    if (dropZoneIdx === 0) {
      const top = roomsInThisLevel[0]
      if (top) newVal = top.orderValue / 1.1 // 1.1 slows down the approach to 0
      else newVal = GAP // you're dragging a new subtask into a parent that previously had ZERO children, which is valid
    }
    else if (dropZoneIdx === n) {
      const bottom = roomsInThisLevel[n-1] 
      newVal = bottom.orderValue + GAP
      if (newVal >= $user.maxOrderValue) {
        User.update({
          maxOrderValue: newVal + GAP
        })
      }
    }
    else {
      const above = roomsInThisLevel[dropZoneIdx - 1]
      const below = roomsInThisLevel[dropZoneIdx]
      newVal = (above.orderValue + below.orderValue) / 2
    }

    const keyValueChanges = {
      parentID,
      orderValue: newVal,
      persistsOnList: true, // non-persistent tasks, once dragged to the list, becomes persistent. very important, otherwise any node could disappear from the complex task structure just because it's scheduled, some day.
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
</script>