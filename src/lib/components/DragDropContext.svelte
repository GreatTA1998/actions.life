<script>
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'
  import { createThrottledFunction } from '$lib/utils/core.js'
  import { playSound } from '$lib/features/audio.js'

  let { children } = $props()

  const draggedItem = writable(Empty())
  const matchedDropzones = writable({})
  const bestDropzoneID = writable('')
  const hasDropped = writable(false)
  const scrollCalRect = writable(() => ({ left: 0, top: 0, right: Infinity, bottom: Infinity }))
  const logicAreaRect = writable(() => ({ left: 0, top: 0, right: Infinity, bottom: Infinity }))

  const frameRate = 60
  const oneThousandMs = 1000
  const throttledPositionUpdate = createThrottledFunction(updateDraggedItemPosition, oneThousandMs/frameRate)
  const dropPreviewCSS = `
    background-color: rgba(100, 100, 255, 0.15);
    border: 1px dashed rgba(100, 100, 255, 0.6);
  `

  setContext('drag-drop', {
    draggedItem,
    bestDropzoneID,
    dropPreviewCSS,
    scrollCalRect,
    logicAreaRect,
    startTaskDrag,
    computeOrderValue,
    registerDropzone
  })

  function startTaskDrag ({ e, id, isFromCal = false }) {
    if (e.target !== e.currentTarget) return // effectively `click|self`
    // don't call preventDefault(), otherwise drag doesn't even start
    e.stopPropagation() // stops rare occasions where the entire UI gets dragged (which'd be scary)
    e.dataTransfer.setData("text/plain", id) // without this iOS won't activate drag!
    reset()

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
      playSound('tap')
    }
  }

  function resolveBest (dropzones) {
    let maxOverlap = 0
    let bestDropzoneID = ''
    for (const [dropzoneID, { area, left }] of Object.entries(dropzones)) {
      if (area === maxOverlap && left > dropzones[bestDropzoneID].left) {
        bestDropzoneID = dropzoneID
      }
      else if (area > maxOverlap) {
        maxOverlap = area
        bestDropzoneID = dropzoneID
      }
    }
    return bestDropzoneID
  }

  function reset () {
    draggedItem.set(Empty())
    matchedDropzones.set({})
    bestDropzoneID.set('')
    hasDropped.set(false)
  }

  function Empty () {
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

  const normalizedHeight = 12 // so oversized drag items (due to tall duration) can target small dropzones

  export function detectOverlap ({ dropzoneElem, clipRect, dropzoneID, normalizeDragItemHeight }) {
    const { x1, y1, x2, y2 } = $draggedItem
    const item = { left: x1, top: y1, right: x2, bottom: normalizeDragItemHeight ? y1 + normalizedHeight : y2 }
    const dropzone = intersect(dropzoneElem.getBoundingClientRect(), clipRect)
    const overlap = intersect(item, dropzone)

    matchedDropzones.update(zones => {
      if (overlap.width > 0 && overlap.height > 0) {
        zones[dropzoneID] = { area: overlap.width * overlap.height, left: dropzone.left }
      } else {
        delete zones[dropzoneID]
      }
      return zones
    })
  }

  function intersect (a, b) {
    const left = Math.max(a.left, b.left)
    const top = Math.max(a.top, b.top)
    const right = Math.min(a.right, b.right)
    const bottom = Math.min(a.bottom, b.bottom)
    return { left, top, right, bottom, width: right - left, height: bottom - top }
  }

  function computeOrderValue (i, rooms) {
    const k = 1
    const n = rooms.length

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

  // attachment factory pattern (to pass in arbitrary parameters via currying)
  function registerDropzone ({ clipRectFunction, id, onDrop, normalizeDragItemHeight = false }) {
    return (node) => {
      $effect(() => {
        if ($draggedItem.id) {
          detectOverlap({
            dropzoneElem: node,
            clipRect: clipRectFunction(),
            dropzoneID: id,
            normalizeDragItemHeight
          })
        }
      })
      
      $effect(() => {
        if ($hasDropped && $bestDropzoneID === id) {
          onDrop()
          reset()
        }
      })
      
      return () => {
        matchedDropzones.update(obj => {
          delete obj[id]
          return obj
        })
      }
    }
  }
</script>

<div {ondragover} {ondrop} class="h-full">
  {@render children()}
</div>