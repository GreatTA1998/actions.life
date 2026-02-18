<script>
  import { setContext } from 'svelte'
  import { writable } from 'svelte/store'
  import { createThrottledFunction } from '$lib/utils/core.js'
  import { playSound } from '$lib/features/audio.js'

  let { children } = $props()

  const draggedItem = writable(initialItem())
  const matchedDropzones = writable({})
  const bestDropzoneID = writable('')
  const hasDropped = writable(false)
  const scrollCalRect = writable(() => ({ left: 0, top: 0, right: 9999, bottom: 9999 }))
  const logicAreaRect = writable(() => ({ left: 0, top: 0, right: 9999, bottom: 9999 }))

  const frameRate = 60
  const oneThousandMs = 1000
  const throttledPositionUpdate = createThrottledFunction(updateDraggedItemPosition, oneThousandMs/frameRate)
  const dropPreviewCSS = `
    background-color: rgba(100, 100, 255, 0.15);
    border: 1px dashed rgba(100, 100, 255, 0.6);
    pointer-events: none;
  `

  setContext('drag-drop', {
    draggedItem,
    matchedDropzones,
    bestDropzoneID,
    hasDropped,
    scrollCalRect,
    logicAreaRect,
    startTaskDrag,
    resetDragDrop,
    detectOverlap,
    computeOrderValue,
    dropPreviewCSS
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
      playSound('tap')
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

  export function detectOverlap ({ dropzoneElem, clipRect, dropzoneID }) { 
    const dropzone = clip(
      dropzoneElem.getBoundingClientRect(),
      clipRect
    )
    if (isOverlapping($draggedItem, dropzone, 0, 0)) { // h_threshold as destructured parameters
      matchedDropzones.update(obj => {
        obj[dropzoneID] = {
          area: getOverlapArea($draggedItem, dropzone),
          left: dropzone.left
        }
        return obj
      })
    } else {
      matchedDropzones.update(obj => {
        delete obj[dropzoneID]
        return obj
      })
    }
  }

  function clip (obj, bound) {
    return {
      left: Math.max(obj.left, bound.left),
      right: Math.min(obj.right, bound.right),
      top: Math.max(obj.top, bound.top), 
      bottom: Math.min(obj.bottom, bound.bottom)
    }
  }

  function isOverlapping ({ x1, x2, y1, y2 }, { top, left, bottom, right }, h_threshold = 0.3, v_threshold = 0) {
    const hOverlap = Math.max(0, Math.min(x2, right) - Math.max(x1, left))
    const vOverlap = Math.max(0, Math.min(y2, bottom) - Math.max(y1, top))
    return hOverlap / (x2 - x1) > h_threshold && vOverlap / (y2 - y1) > v_threshold
  }

  function getOverlapArea ({ x1, x2, y1, y2 }, { top, left, bottom, right }) {
    const hOverlap = Math.max(0, Math.min(x2, right) - Math.max(x1, left))
    const vOverlap = Math.max(0, Math.min(y2, bottom) - Math.max(y1, top))
    return hOverlap * vOverlap
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
</script>

<div {ondragover} {ondrop}>
  {@render children()}
</div>