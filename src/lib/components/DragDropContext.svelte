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
    startMouseDrag, startTouchDrag, computeOrderValue, registerDropzone
  })

  // ── mouse ───────────────────────────────────────────────────────────────

  function startMouseDrag ({ e, id }) {
    if (e.button > 0) return
    e.stopPropagation()
    drag = makeDrag(e.currentTarget, id, e.clientX, e.clientY, 'mouse')
  }

  function onmousemove (e) {
    if (!drag || drag.kind !== 'mouse') return

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
    if (!drag || drag.kind !== 'mouse') return
    if (drag.active) {
      finish()
      // Mouse synthesizes click after mouseup; catch it at document (Svelte delegates onclick).
      swallowNextClick()
    } else {
      abandon()
    }
  }

  // ── touch ───────────────────────────────────────────────────────────────

  function startTouchDrag ({ e, id }) {
    const t = e.changedTouches[0]
    if (!t) return
    e.stopPropagation()
    drag = makeDrag(e.currentTarget, id, t.clientX, t.clientY, 'touch', t.identifier)
    drag.timer = setTimeout(() => {
      if (drag?.touchId !== t.identifier) return
      activate()
      lockScroll()
    }, HOLD_MS)
  }

  function ontouchmove (e) {
    if (!drag) return
    const t = touchById(e.touches, drag.touchId)
    if (!t) return

    if (drag.active) {
      track(t.clientX, t.clientY)
      return
    }

    // Still waiting on the hold — finger moved too far → treat as scroll
    if (Math.hypot(t.clientX - drag.sx, t.clientY - drag.sy) > HOLD_SLOP) {
      abandon()
    }
  }

  function ontouchend (e) {
    if (!drag) return
    if (!touchById(e.changedTouches, drag.touchId)) return
    if (drag.active) {
      unlockScroll()
      finish()
    } else {
      abandon()
    }
  }

  function ontouchcancel (e) {
    if (!drag) return
    if (!touchById(e.changedTouches, drag.touchId)) return
    if (drag.active) unlockScroll()
    abandon()
  }

  function lockScroll () {
    document.addEventListener('touchmove', preventScroll, { passive: false, capture: true })
  }

  function unlockScroll () {
    document.removeEventListener('touchmove', preventScroll, { capture: true })
  }

  function preventScroll (e) { e.preventDefault() }

  // ── shared ─────────────────────────────────────────────────────────────

  function makeDrag (el, id, clientX, clientY, kind, touchId = null) {
    const { top, left, width, height } = el.getBoundingClientRect()
    return {
      kind, el, id, touchId,
      ox: clientX - left, oy: clientY - top,
      sx: clientX, sy: clientY,
      left, top, width, height,
      active: false, moved: false, timer: 0
    }
  }

  function activate () {
    if (!drag || drag.active) return
    drag.active = true
    clearTimeout(drag.timer)

    draggedItem.set({
      id: drag.id, width: drag.width, height: drag.height,
      offsetX: drag.ox, offsetY: drag.oy,
      x1: drag.left, y1: drag.top,
      x2: drag.left + drag.width, y2: drag.top + drag.height
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

  function track (clientX, clientY) {
    drag.moved = true
    const x1 = clientX - drag.ox, y1 = clientY - drag.oy
    ghost.style.transform = `translate3d(${x1}px, ${y1}px, 0)`
    draggedItem.update(i => {
      i.x1 = x1; i.y1 = y1
      i.x2 = x1 + i.width; i.y2 = y1 + i.height
      return i
    })
    pickZone()
  }

  function finish () {
    const { moved } = drag
    teardown()
    if (moved) {
      pickZone()
      const zone = zones.get(get(bestDropzoneID))
      if (zone) {
        zone.onDrop()
        playSound('tap', 0.125)
      }
    }
    reset()
  }

  function abandon () {
    teardown()
    reset()
  }

  function teardown () {
    if (!drag) return
    clearTimeout(drag.timer)
    drag = null
  }

  function swallowNextClick () {
    const stop = (ev) => {
      ev.stopImmediatePropagation()
      ev.preventDefault()
      disarm()
    }
    const disarm = () => {
      clearTimeout(t)
      document.removeEventListener('click', stop, true)
    }
    // Capture on document so we win over delegated target handlers; timeout if no click.
    document.addEventListener('click', stop, true)
    const t = setTimeout(disarm, 50)
  }

  function touchById (list, id) {
    for (let i = 0; i < list.length; i++) if (list[i].identifier === id) return list[i]
    return null
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

  function reset () {
    ghost?.remove()
    ghost = null
    draggedItem.set(empty())
    bestDropzoneID.set('')
  }

  function registerDropzone ({ clipRectFunction, id, onDrop, normalizeDragItemHeight = false }) {
    return (node) => {
      zones.set(id, { node, clipRectFunction, onDrop, normalizeDragItemHeight })
      if (get(draggedItem).id) pickZone()
      return () => { if (zones.get(id)?.node === node) zones.delete(id) }
    }
  }

  function empty () {
    return { id: '', x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0, offsetX: 0, offsetY: 0 }
  }

  function computeOrderValue (i, rooms) {
    const n = rooms.length
    if (i === 0) return rooms[0] ? rooms[0].orderValue / 1.1 : 1
    if (i === n) return rooms[n - 1].orderValue + 1
    return (rooms[i - 1].orderValue + rooms[i].orderValue) / 2
  }
</script>

<svelte:window
  {onmousemove}
  {onmouseup}
  {ontouchmove}
  {ontouchend}
  {ontouchcancel}
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
    opacity: 0.5;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
</style>
