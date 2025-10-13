<script>
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'
  import { createThrottledFunction } from '$lib/utils/core.js'

  let { children } = $props()

  const draggedItem = writable(
    initialItem()
  )

  const matchedDropzones = writable({})
  const bestDropzoneID = writable('')
  const hasDropped = writable(false)
  const scrollCalRect = writable(() => {})
  const logicAreaRect = writable(() => {})

  const frameRate = 60
  const oneThousandMs = 1000
  const throttledPositionUpdate = createThrottledFunction(updateDraggedItemPosition, oneThousandMs/frameRate)

  setContext('drag-drop', {
    draggedItem,
    matchedDropzones,
    bestDropzoneID,
    hasDropped,
    scrollCalRect,
    logicAreaRect,
    startTaskDrag,
    resetDragDrop
  })

  function startTaskDrag ({ e, id, isFromCal = false }) {
    if (e.target !== e.currentTarget) return // effectively `click|self`
    // don't call preventDefault(), otherwise drag doesn't even start
    e.stopPropagation() // stops rare occasions where the entire UI gets dragged (which'd be scary)
    e.dataTransfer.setData("text/plain", id) // without this iOS won't activate drag!
    resetDragDrop() // defensive programming for now

    const { top, left, width, height } = e.target.getBoundingClientRect()
    
    draggedItem.update(i => {
      i.x1 = left
      i.y1 = top
      i.x2 = i.x1 + width
      i.y2 = i.y1 + height

      i.width = width
      i.height = height

      i.offsetX = e.clientX - left
      i.offsetY = e.clientY - top

      i.id = id
      i.isFromCal = isFromCal

      return i
    })
    // TO-DO: include the whole task object otherwise treeISOs related logic will fail
  }

  function ondragover (e) {
    e.preventDefault() // otherwise drop is disallowed
    e.dataTransfer.dropEffect = 'move' // explicitly define a plain effect. Without it, Mac would show a green + icon which is distracting

    if ($draggedItem.id) {
      throttledPositionUpdate(e)
    }
  }

  function updateDraggedItemPosition (e) {
    draggedItem.update(i => {
      i.x1 = e.clientX - i.offsetX
      i.y1 = e.clientY - i.offsetY
      i.x2 = i.x1 + i.width
      i.y2 = i.y1 + i.height
      return i
    })
    bestDropzoneID.set(
      resolveBest($matchedDropzones)
    )
  }

  function ondrop (e) {
    e.preventDefault() // prevent the browser navigating to what it thinks is the newly dropped URL. Note web.dev is WRONG using e.stopPropagation() here!
    
    if ($draggedItem.id) {
      bestDropzoneID.set(
        resolveBest($matchedDropzones)
      )
      hasDropped.set(true)
    }
  }

  function resolveBest (dropzones) {
    let maxOverlap = 0
    let bestDropzoneID = ''
    for (const [dropzoneID, { area, left }] of Object.entries(dropzones)) {
      const overlap = area
      if (overlap === maxOverlap) {
        if (left > dropzones[bestDropzoneID].left) {
          bestDropzoneID = dropzoneID
        }
      }
      if (overlap > maxOverlap) {
        maxOverlap = overlap
        bestDropzoneID = dropzoneID
      }
    }
    return bestDropzoneID
  }

  function resetDragDrop () {
    draggedItem.set(initialItem())
    matchedDropzones.set({})
    bestDropzoneID.set('')
    hasDropped.set(false)
  }

  function initialItem () {
    return {
      x1: null,
      y1: null,
      x2: null,
      y2: null,
      offsetX: null,
      offsetY: null,
      kind: '',
      id: ''
    }
  }
</script>

<div {ondragover} {ondrop}>
  {@render children()}
</div>