<div
  bind:this={ReorderDropzone} 
  style="height: {heightInPx}px; border-radius: {heightInPx / 2}px; border: 0px solid {colorForDebugging};" 
  on:dragenter={() => {
    // quickfix as even if it's an invalid operation it's unintuitive to not see the drag area highlight
    if (!isInvalidReorderDrop() || true) {
      ReorderDropzone.style.background = 'rgb(87, 172, 247)' 
    }
  }}
  on:dragleave={() => ReorderDropzone.style.background = '' }
  on:dragover={(e) => dragover_handler(e)}
  on:drop|stopPropagation={(e) => onReorderDrop(e)}
>

</div>

<script>
  import { user, activeDragItem } from '/src/store'
  import { increment, writeBatch, doc } from 'firebase/firestore'
  import { db } from '../../db/init'
  import Task from '/src/db/Task.js'
  import { HEIGHTS } from '/src/utils/constants.js'
  import { listTreeNodes } from '/src/db/treeISOs.js'

  export let listID = ''
  export let ancestorRoomIDs
  export let roomsInThisLevel
  export let idxInThisLevel
  export let parentID = ''
  export let colorForDebugging = "red"
  export let heightInPx = HEIGHTS.SUB_DROPZONE

  let ReorderDropzone
  let batch = writeBatch(db)

  $: n = roomsInThisLevel.length

  function isInvalidReorderDrop () {
    return !['room', 'top-level-task-within-this-todo-list'].includes($activeDragItem.kind) || ancestorRoomIDs.includes($activeDragItem.id)
  }

  function dragover_handler (e) {
    e.preventDefault()
    e.stopPropagation()
  }

  async function onReorderDrop (e) {
    e.preventDefault()
    e.stopPropagation()
    if (isInvalidReorderDrop()) {
      alert('A parent task cannot become its own descendant')
      return
    }
    ReorderDropzone.style.background = ''

    batch = writeBatch(db)

    const data = e.dataTransfer.getData('text/plain')
    const keyValuePairs = data.split(']')

    const [key1, value1] = keyValuePairs[0].split(':')
    const draggedRoomID = value1

    // before updating `orderValue`, we update
    // the counter showing how many subfolders a folder has
    const droppedRoomDoc = roomsInThisLevel[idxInThisLevel]

    const initialNumericalDifference = 3
    let newVal 

    // TO-DO: need the last drop zone to be manually added
    const dropZoneIdx = idxInThisLevel
    // copy `PopupRearrangeVideos` 
    if (dropZoneIdx === 0) {
      const topOfOrderDoc = roomsInThisLevel[0]
      if (topOfOrderDoc) {
        // halve the value so it never gets to 0 
        newVal = (topOfOrderDoc.orderValue || 3) / 1.1
      } else {
        // you're dragging a new subtask into a parent that previously had ZERO children, which is valid
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

    const { id } = $activeDragItem
    
    // 2. UNSCHEDULE: when you drag to the to-do list, it always unschedules it from the calendar
    const updateObj = {
      orderValue: newVal,
      startDateISO: '',
      startTime: '',
      listID
    }

    // 4. PARENTID
    if ($activeDragItem.kind === 'top-level-task-within-this-todo-list' && ancestorRoomIDs.length === 1) {
      // preserve parent relationship
    } else {
      updateObj.parentID = parentID
    }

    // list drag about logical grouping i.e. parentID and listID are affected, but scheduling is unaffected
    const descendants = listTreeNodes($activeDragItem)
    for (const descendant of descendants) {
      batch.update(doc(db, `users/${$user.uid}/tasks/${descendant.id}`), {
        listID
      })
    }

    let ref = null
    ref = doc(db, `users/${$user.uid}/tasks/${id}`)
    Task.update({ id, keyValueChanges: updateObj })

    try {
      batch.commit() // for updating user's maxOrderValue
      activeDragItem.set(null)
    } catch (error) {
      alert('Error updating, please reload the page')
    }
  }
</script> 