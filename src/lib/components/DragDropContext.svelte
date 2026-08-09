<script>
  import { setContext } from 'svelte'
  import { writable, get } from 'svelte/store'
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
  const touchSlop = 10
  const touchActivateMs = 300
  const throttledPositionUpdate = createThrottledFunction(updateDraggedItemPosition, oneThousandMs/frameRate)
  const dropPreviewCSS = `
    background-color: rgba(var(--drag-preview), 0.15);
    border: 1px dashed rgba(var(--drag-preview), 0.6);
  `

  let ghostEl = null
  let sourceEl = null

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
    // pointerdown targets the child; dragstart used to retarget to the draggable.
    // Allow name/notes <button>s (main grab targets in RecursiveTask). Skip controls
    // that own the gesture: checkbox, menu, etc.
    const noDrag = e.target.closest?.('input, textarea, select, label, a, [popovertarget], [data-no-drag]')
    if (noDrag && noDrag !== e.currentTarget) return
    e.stopPropagation()

    const el = e.currentTarget
    const pointerId = e.pointerId
    el.setPointerCapture(pointerId)

    const { top, left, width, height } = el.getBoundingClientRect()
    const offsetX = e.clientX - left
    const offsetY = e.clientY - top
    const startX = e.clientX
    const startY = e.clientY

    let activated = false
    let didMove = false
    let activationTimer

    function activate () {
      if (activated) return
      activated = true
      reset()

      draggedItem.set({
        x1: left,
        y1: top,
        x2: left + width,
        y2: top + height,
        width,
        height,
        offsetX,
        offsetY,
        kind: '',
        id,
        isFromCal
      })

      sourceEl = el
      sourceEl.style.opacity = '0.1'

      ghostEl = el.cloneNode(true)
      if (ghostEl.id) ghostEl.removeAttribute('id')
      ghostEl.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'))
      Object.assign(ghostEl.style, {
        position: 'fixed',
        left: `${left}px`,
        top: `${top}px`,
        width: `${width}px`,
        height: `${height}px`,
        boxSizing: 'border-box',
        margin: '0',
        pointerEvents: 'none',
        zIndex: '10000',
        opacity: '0.45',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
      })
      document.body.appendChild(ghostEl)

      document.addEventListener('touchmove', preventTouchScroll, { passive: false, capture: true })
    }

    if (e.pointerType === 'touch') {
      activationTimer = setTimeout(activate, touchActivateMs)
    }

    function onMove (ev) {
      if (ev.pointerId !== pointerId) return

      if (activated) {
        ev.preventDefault()
        didMove = true
        throttledPositionUpdate(ev)
      } else if (Math.hypot(ev.clientX - startX, ev.clientY - startY) > touchSlop) {
        if (ev.pointerType === 'touch') {
          clearTimeout(activationTimer) // finger intends to scroll
        } else {
          ev.preventDefault()
          activate()
          didMove = true
          throttledPositionUpdate(ev)
        }
      }
    }

    function onUp (ev) {
      if (ev.pointerId !== pointerId) return
      teardown()

      if (activated && didMove) {
        suppressClick(el)
        const best = resolveBest($matchedDropzones)
        bestDropzoneID.set(best)
        if (best) {
          hasDropped.set(true)
          playSound('tap', 0.125)
        } else {
          reset()
        }
      } else if (activated) {
        reset()
      }
    }

    function onCancel (ev) {
      if (ev.pointerId !== pointerId) return
      teardown()
      if (activated) reset()
    }

    function teardown () {
      clearTimeout(activationTimer)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onCancel)
      if (el.hasPointerCapture(pointerId)) {
        el.releasePointerCapture(pointerId)
      }
      document.removeEventListener('touchmove', preventTouchScroll, { capture: true })
    }

    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onCancel)
  }

  function preventTouchScroll (e) {
    e.preventDefault()
  }

  function suppressClick (el) {
    const stop = (ev) => {
      ev.stopImmediatePropagation()
      ev.preventDefault()
      el.removeEventListener('click', stop, true)
    }
    el.addEventListener('click', stop, true)
  }

  function updateDraggedItemPosition (e) {
    draggedItem.update(i => {
      i.x1 = e.clientX - i.offsetX
      i.y1 = e.clientY - i.offsetY
      i.x2 = i.x1 + i.width
      i.y2 = i.y1 + i.height
      if (ghostEl) {
        ghostEl.style.left = `${i.x1}px`
        ghostEl.style.top = `${i.y1}px`
      }
      return i
    })
    bestDropzoneID.set(
      resolveBest($matchedDropzones)
    )
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
    if (ghostEl) {
      ghostEl.remove()
      ghostEl = null
    }
    if (sourceEl) {
      sourceEl.style.opacity = ''
      sourceEl = null
    }
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
    // keep highlight in sync on activate (hold) as well as on move
    bestDropzoneID.set(resolveBest(get(matchedDropzones)))
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

<div class="h-full">
  {@render children()}
</div>
