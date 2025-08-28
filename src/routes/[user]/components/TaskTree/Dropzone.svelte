<div
  bind:this={ReorderDropzone} 
  class:highlight={$bestDropzoneID === dropzoneID}
  style="height: {heightInPx}px; border-radius: {heightInPx / 2}px; outline: 0px solid {colorForDebugging};" 
></div>

<script>
  import { isOverlapping, getOverlapArea, emptyItem, clip } from '$lib/utils/dragDrop.js'
  import { increment, writeBatch, doc } from 'firebase/firestore'
  import { db } from '$lib/db/init'
  import { HEIGHTS } from '$lib/utils/constants.js'
  import { getRandomID } from '$lib/utils/core.js'
  import { getContext } from 'svelte'

  const { 
    Task, user, 
    draggedItem, hasDropped, bestDropzoneID, matchedDropzones, logicAreaRect 
  } = getContext('app')

  let {
    ancestorRoomIDs,
    roomsInThisLevel,
    idxInThisLevel,
    parentID = '',
    colorForDebugging = 'red',
    heightInPx = HEIGHTS.SUB_DROPZONE
  } = $props()

  let ReorderDropzone
  let batch = writeBatch(db)
  let n = $derived(roomsInThisLevel.length)
  let intersecting = $state(false)

  const dropzoneID = getRandomID()

  $effect(() => {
    if ($draggedItem) {
      requestAnimationFrame(() => {
        checkIntersection(
          clip(
            $draggedItem, 
            $logicAreaRect()
          )
        )
      })
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

  function isInvalidReorderDrop () {
    return ancestorRoomIDs.includes($draggedItem.id)
  }
 
  async function onReorderDrop () {
    // show red dropzone if it's invalid
    if (isInvalidReorderDrop()) {
      alert('A parent task cannot become its own descendant')
      return
    }
    ReorderDropzone.style.background = ''

    batch = writeBatch(db)

    const initialNumericalDifference = 3
    let newVal 

    // TO-DO: need the last drop zone to be manually added
    const dropZoneIdx = idxInThisLevel
    if (dropZoneIdx === 0) {
      const topOfOrderDoc = roomsInThisLevel[0]
      if (topOfOrderDoc) {
        newVal = (topOfOrderDoc.orderValue || 3) / 1.1 // 1.1 slows down the approach to 0
      } else { // you're dragging a new subtask into a parent that previously had ZERO children, which is valid
        newVal = 3
      }
    }
    else if (dropZoneIdx === n) {
      const bottomOfOrderDoc = roomsInThisLevel[n-1]
      newVal = (bottomOfOrderDoc.orderValue || 0) + initialNumericalDifference
      
      // keep track fo the highest possible maxOrdervalue for this $user
      if (!$user.maxOrderValue || $user.maxOrderValue < newVal) {
        batch.update(
          doc(db, `/users/${$user.uid}/`), {
            maxOrderValue: increment(initialNumericalDifference)
          }
        )
      }

      newVal = Math.max(newVal, $user.maxOrderValue)
    }
    else {
      let topNeighborDoc = roomsInThisLevel[dropZoneIdx - 1]
      let botNeighborDoc = roomsInThisLevel[dropZoneIdx]
      const order1 = botNeighborDoc.orderValue || 3
      const order2 = topNeighborDoc.orderValue || 3 + initialNumericalDifference
      newVal = (order1 + order2) / 2
    }
    
    Task.update({ id: $draggedItem.id, keyValueChanges: {
      parentID,
      orderValue: newVal,
      persistsOnList: true // non-persistent tasks, once dragged to the list, becomes persistent. very important, otherwise any node could disappear from the complex task structure just because it's scheduled, some day.
    }})

    try {
      await batch.commit() // for updating user's maxOrderValue
      draggedItem.set(emptyItem())
      hasDropped.set(false)
    } catch (error) {
      alert('Error updating, please reload the page')
    }
  }
</script>

<style>
  .highlight {
    background-color: rgb(87, 172, 247);
  }
</style>