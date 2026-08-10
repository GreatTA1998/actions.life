<script>
  import { setContext } from 'svelte'
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

  const SLOP = 10, HOLD_SLOP = 40, HOLD_MS = 300
  const zones = new Map()
  let drag = null, ghost = null

  setContext('drag-drop', {
    draggedItem, bestDropzoneID, dropPreviewCSS, scrollCalRect, logicAreaRect,
    startTaskDrag, computeOrderValue, registerDropzone
  })

  function startTaskDrag ({ e, id }) {
    // const block = e.target.closest?.('input, textarea, select, label, a, [popovertarget], [data-no-drag]')
    // if ((block && block !== e.currentTarget) || e.button > 0) return // stylus often sends button -1
    e.stopPropagation()

    const el = e.currentTarget
    const { top, left, width, height } = el.getBoundingClientRect()
    drag = {
      el, 
      id, 
      pointerId: e.pointerId,
      ox: e.clientX - left, 
      oy: e.clientY - top,
      sx: e.clientX, 
      sy: e.clientY, left, top, width, height,
      hold: e.pointerType !== 'mouse', 
      live: false, 
      moved: false,
      timer: 0, 
      pendingHit: false
    }
    if (drag.hold) {
      drag.timer = setTimeout(() => { if (drag?.pointerId === e.pointerId) activate() }, HOLD_MS)
    }
  }

  function activate () {
    if (!drag || drag.live) return
    drag.live = true

    // Hold-to-drag: touch-action is already decided for this gesture, so lock via touchmove.
    document.addEventListener('touchmove', preventScroll, { passive: false, capture: true })
    drag.el.setPointerCapture(drag.pointerId)

    clearGhost()
    draggedItem.set({
      id: drag.id, width: drag.width, height: drag.height, offsetX: drag.ox, offsetY: drag.oy,
      x1: drag.left, y1: drag.top, x2: drag.left + drag.width, y2: drag.top + drag.height
    })
    bestDropzoneID.set('')
    ghost = drag.el.cloneNode(true)
    ghost.removeAttribute('id')
    ghost.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'))
    ghost.classList.add('drag-ghost')
    Object.assign(ghost.style, {
      width: `${drag.width}px`, height: `${drag.height}px`,
      transform: `translate3d(${drag.left}px, ${drag.top}px, 0)`
    })
    document.body.appendChild(ghost)
    pickZone()
  }

  function track (e) {
    drag.moved = true
    const x1 = e.clientX - drag.ox, y1 = e.clientY - drag.oy
    ghost.style.transform = `translate3d(${x1}px, ${y1}px, 0)`
    draggedItem.update(i => {
      i.x1 = x1; i.y1 = y1
      i.x2 = x1 + i.width; i.y2 = y1 + i.height
      return i
    })
    // Coalesce hit-tests to one per frame; stale rAFs no-op once drag is cleared.
    if (!drag.pendingHit) {
      drag.pendingHit = true
      requestAnimationFrame(() => {
        if (!drag) return
        drag.pendingHit = false
        pickZone()
      })
    }
  }

  function onpointermove (e) {
    if (!drag || e.pointerId !== drag.pointerId) return

    if (drag.live) { e.preventDefault(); return track(e) }

    const dist = Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy)
    if (drag.hold) {
      if (dist > HOLD_SLOP) { 
        clearTimeout(drag.timer) 
        drag = null 
      }
      return
    }
    if (dist <= SLOP) return
    e.preventDefault()
    activate()
    track(e)
  }
  function onpointerup (e) { 
    if (drag?.pointerId === e.pointerId) end(false) 
  }

  function onpointercancel (e) { 
    if (drag?.pointerId === e.pointerId) end(true) 
  }

  function onlostpointercapture (e) {
    if (drag?.live && e.pointerId === drag.pointerId) end(true)
  }

  function end (cancelled) {
    if (!drag) return
    const { el, pointerId, timer, live, moved } = drag
    drag = null
    clearTimeout(timer)
    if (el.hasPointerCapture?.(pointerId)) {
      el.releasePointerCapture(pointerId)
    }
    if (!live) return
    document.removeEventListener('touchmove', preventScroll, { capture: true })

    if (!cancelled && moved) {
      const stop = (ev) => { ev.stopImmediatePropagation(); ev.preventDefault(); el.removeEventListener('click', stop, true) }
      el.addEventListener('click', stop, true)
      pickZone()
      const zone = zones.get(get(bestDropzoneID))
      if (zone) {
        zone.onDrop()
        playSound('tap', 0.125)
      }
    }
    reset()
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

  function clearGhost () {
    ghost?.remove()
    ghost = null
  }
  function reset () {
    clearGhost()
    draggedItem.set(empty())
    bestDropzoneID.set('')
  }

  function computeOrderValue (i, rooms) {
    const n = rooms.length
    if (i === 0) return rooms[0] ? rooms[0].orderValue / 1.1 : 1
    if (i === n) return rooms[n - 1].orderValue + 1
    return (rooms[i - 1].orderValue + rooms[i].orderValue) / 2
  }

  function registerDropzone ({ clipRectFunction, id, onDrop, normalizeDragItemHeight = false }) {
    return (node) => {
      zones.set(id, { node, clipRectFunction, onDrop, normalizeDragItemHeight })
      if (get(draggedItem).id) pickZone()
      return () => { if (zones.get(id)?.node === node) zones.delete(id) }
    }
  }

  function preventScroll (e) {
    e.preventDefault()
  }

  function empty () {
    return { id: '', x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0, offsetX: 0, offsetY: 0 }
  }
</script>

<svelte:window
  {onpointermove}
  {onpointerup}
  {onpointercancel}
  {onlostpointercapture}
/>

<div class="h-full">{@render children()}</div>

<style>
  :global(.drag-ghost) {
    position: fixed;
    left: 0;
    top: 0;
    margin: 0;
    pointer-events: none;
    z-index: 10000;
    opacity: 0.45;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    will-change: transform;
  }
</style>
