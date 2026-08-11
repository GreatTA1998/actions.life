<script>
  import { setContext } from 'svelte'
  import { on } from 'svelte/events'
  import { writable, get } from 'svelte/store'
  import { playSound } from '$lib/features/audio.js'

  let { children } = $props()

  const unbound = () => ({ left: 0, top: 0, right: Infinity, bottom: Infinity })
  const draggedItem = writable(empty())
  const bestDropzoneID = writable('')
  const scrollCalRect = writable(unbound)
  const logicAreaRect = writable(unbound)
  const dropPreviewCSS = `
    background-color: rgba(var(--drag-preview), 0.15);
    border: 1px dashed rgba(var(--drag-preview), 0.6);
  `

  const SLOP = 10, HOLD_SLOP = 10, HOLD_MS = 150
  const zones = new Map()
  let drag = null, ghost = null, holdTimer = 0

  setContext('drag-drop', {
    draggedItem, bestDropzoneID, dropPreviewCSS, scrollCalRect, logicAreaRect,
    startMouseDrag, startTouchDrag, computeOrderValue, registerDropzone
  })

  function startMouseDrag ({ e, id }) {
    e.stopPropagation()
    drag = makeDrag(e.currentTarget, id, e.clientX, e.clientY)
  }

  function onmousemove (e) {
    if (!drag) return

    if (drag.active) {
      e.preventDefault()
      track(e.clientX, e.clientY)
      return
    }

    if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > SLOP) {
      activate()
      track(e.clientX, e.clientY)
    }
  }

  function onmouseup () {
    if (drag?.active) {
      drop()

      const swallow = e => e.stopImmediatePropagation()
      document.addEventListener('click', swallow, true)
      setTimeout(() => document.removeEventListener('click', swallow, true), 50)
    }
    reset()
  }

  function startTouchDrag ({ e, id }) {
    e.stopPropagation()
    const [touch] = e.changedTouches
    drag = makeDrag(e.currentTarget, id, touch.clientX, touch.clientY)
    holdTimer = setTimeout(activate, HOLD_MS)
  }

  const nonpassivetouchmove = (node) => on(node, 'touchmove', ontouchmove, { passive: false })

  function ontouchmove (e) {
    if (!drag) return
    const [touch] = e.touches

    if (drag.active) {
      e.preventDefault()
      track(touch.clientX, touch.clientY)
    }

    else if (Math.hypot(touch.clientX - drag.sx, touch.clientY - drag.sy) > HOLD_SLOP) {
      clearTimeout(holdTimer)
      drag = null
    }
  }

  function ontouchend () {
    if (drag?.active) {
      drop()
    }
    reset()
  }

  function makeDrag (el, id, clientX, clientY) {
    const { left, top } = el.getBoundingClientRect()
    return {
      el, 
      id, 
      sx: clientX, 
      sy: clientY,
      offsetX: clientX - left, 
      offsetY: clientY - top,
      active: false
    }
  }

  function activate () {
    if (!drag || drag.active) return
    drag.active = true
    clearTimeout(holdTimer)

    const { width, height } = drag.el.getBoundingClientRect()
    const x1 = drag.sx - drag.offsetX, y1 = drag.sy - drag.offsetY
    draggedItem.set({ id: drag.id, width, height, x1, y1, x2: x1 + width, y2: y1 + height })
    bestDropzoneID.set('')
    ghost = drag.el.cloneNode(true)
    ghost.removeAttribute('id')
    ghost.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'))
    Object.assign(ghost.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      margin: '0',
      pointerEvents: 'none',
      zIndex: '10000',
      opacity: '0.5',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate3d(${x1}px, ${y1}px, 0)`
    })
    document.body.appendChild(ghost)
    pickZone()
  }

  function track (clientX, clientY) {
    const x1 = clientX - drag.offsetX, y1 = clientY - drag.offsetY
    ghost.style.transform = `translate3d(${x1}px, ${y1}px, 0)`
    draggedItem.update(i => {
      i.x1 = x1; i.y1 = y1
      i.x2 = x1 + i.width; i.y2 = y1 + i.height
      return i
    })
    pickZone()
  }

  function drop () {
    pickZone()
    const zone = zones.get(get(bestDropzoneID))
    if (zone) {
      zone.onDrop()
      playSound('tap', 0.125)
    }
  }

  function reset () {
    ghost?.remove()
    ghost = null
    drag = null
    draggedItem.set(empty())
    bestDropzoneID.set('')
    clearTimeout(holdTimer)
  }

  function pickZone () {
    const item = get(draggedItem)
    if (!item.id) { bestDropzoneID.set(''); return }
    let best = '', max = 0, bestLeft = -Infinity
    for (const [id, z] of zones) {
      const bottom = z.normalizeDragItemHeight ? item.y1 + 12 : item.y2
      const zone = intersect(z.node.getBoundingClientRect(), z.clipRectFunction())
      const hit = intersect({ left: item.x1, top: item.y1, right: item.x2, bottom }, zone)
      if (hit.width <= 0 || hit.height <= 0) continue
      const area = hit.width * hit.height
      if (area > max || (area === max && zone.left > bestLeft)) {
        max = area; best = id; bestLeft = zone.left
      }
    }
    bestDropzoneID.set(best)
  }

  function intersect (a, b) {
    const left = Math.max(a.left, b.left), top = Math.max(a.top, b.top)
    const right = Math.min(a.right, b.right), bottom = Math.min(a.bottom, b.bottom)
    return { left, top, right, bottom, width: right - left, height: bottom - top }
  }

  function registerDropzone ({ clipRectFunction, id, onDrop, normalizeDragItemHeight = false }) {
    return (node) => {
      zones.set(id, { node, clipRectFunction, onDrop, normalizeDragItemHeight })
      if (get(draggedItem).id) pickZone()
      return () => { if (zones.get(id)?.node === node) zones.delete(id) }
    }
  }

  function empty () {
    return { id: '', x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0 }
  }

  function computeOrderValue (i, rooms) {
    const n = rooms.length
    if (i === 0) return rooms[0] ? rooms[0].orderValue / 1.1 : 1
    if (i === n) return rooms[n - 1].orderValue + 1
    return (rooms[i - 1].orderValue + rooms[i].orderValue) / 2
  }
</script>

<div class="h-full" {onmousemove} {onmouseup} {@attach nonpassivetouchmove} {ontouchend} ontouchcancel={reset}>
  {@render children()}
</div>