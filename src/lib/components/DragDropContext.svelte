<script>
  import { setContext, tick } from 'svelte'
  import { writable, get } from 'svelte/store'
  import { createThrottledFunction } from '$lib/utils/core.js'
  import { playSound } from '$lib/features/audio.js'

  let { children } = $props()

  const draggedItem = writable(Empty())
  const bestDropzoneID = writable('')
  const scrollCalRect = writable(() => ({ left: 0, top: 0, right: Infinity, bottom: Infinity }))
  const logicAreaRect = writable(() => ({ left: 0, top: 0, right: Infinity, bottom: Infinity }))

  const SLOP = 10
  const SCROLL_SLOP = 40 // before hold arms: only this much movement abandons drag (jitter < this is OK)
  const HOLD_MS = 300
  const NORMALIZED_HEIGHT = 12 // oversized cal blocks still need to hit small zones
  const move = createThrottledFunction(updatePosition, 1000 / 60)
  const dropPreviewCSS = `
    background-color: rgba(var(--drag-preview), 0.15);
    border: 1px dashed rgba(var(--drag-preview), 0.6);
  `

  const zones = new Map() // id → { node, clipRectFunction, onDrop, normalizeDragItemHeight }
  let ghostEl = null
  let drag = null

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
    const block = e.target.closest?.('input, textarea, select, label, a, [popovertarget], [data-no-drag]')
    if (block && block !== e.currentTarget) return
    // button 0 = primary; some Android styluses send -1 — only reject real aux buttons
    if (e.button > 0) return
    e.stopPropagation()

    const el = e.currentTarget
    const { top, left, width, height } = el.getBoundingClientRect()
    // Mouse: drag on move. Pen/touch: hold to arm, then move to drag (so pan still works)
    const needsHold = e.pointerType !== 'mouse'

    drag = {
      el, id, isFromCal, pointerId: e.pointerId,
      offsetX: e.clientX - left, offsetY: e.clientY - top,
      startX: e.clientX, startY: e.clientY,
      left, top, width, height,
      needsHold,
      armed: !needsHold,
      prevTouchAction: el.style.touchAction,
      prevHtmlTouchAction: document.documentElement.style.touchAction,
      scrollLocked: false,
      frozen: [],
      abandoned: false,
      live: false, moved: false, timer: 0
    }

    if (needsHold) {
      drag.timer = setTimeout(() => {
        if (!drag || drag.pointerId !== e.pointerId || drag.abandoned) return
        drag.armed = true
        activate() // preview appears on hold complete, not on the follow-up move
      }, HOLD_MS)
    }
  }

  function lockScroll (el) {
    if (!drag || drag.scrollLocked) return
    drag.scrollLocked = true
    el.style.touchAction = 'none'
    document.documentElement.style.touchAction = 'none'
    document.addEventListener('touchmove', preventScroll, { passive: false, capture: true })
    document.addEventListener('touchstart', preventScroll, { passive: false, capture: true })
    // Pin scrollable ancestors — Boox/Chrome may still pan despite preventDefault
    drag.frozen = []
    for (let node = el; node && node !== document.body; node = node.parentElement) {
      if (node.scrollHeight > node.clientHeight + 1 || node.scrollWidth > node.clientWidth + 1) {
        drag.frozen.push({ node, x: node.scrollLeft, y: node.scrollTop })
      }
    }
    document.addEventListener('scroll', freezeScroll, true)
  }

  function freezeScroll () {
    if (!drag?.frozen) return
    for (const { node, x, y } of drag.frozen) {
      if (node.scrollLeft !== x) node.scrollLeft = x
      if (node.scrollTop !== y) node.scrollTop = y
    }
  }

  function unlockScroll (d) {
    if (!d.scrollLocked) return
    document.removeEventListener('touchmove', preventScroll, { capture: true })
    document.removeEventListener('touchstart', preventScroll, { capture: true })
    document.removeEventListener('scroll', freezeScroll, true)
    d.el.style.touchAction = d.prevTouchAction
    document.documentElement.style.touchAction = d.prevHtmlTouchAction
    d.scrollLocked = false
    d.frozen = []
  }

  function activate () {
    const d = drag
    if (!d || d.live) return
    d.live = true
    lockScroll(d.el)
    try { d.el.setPointerCapture(d.pointerId) } catch { /* Boox may throw */ }
    reset()

    draggedItem.set({
      x1: d.left, y1: d.top, x2: d.left + d.width, y2: d.top + d.height,
      width: d.width, height: d.height,
      offsetX: d.offsetX, offsetY: d.offsetY,
      kind: '', id: d.id, isFromCal: d.isFromCal
    })

    ghostEl = mountGhost(d.el, d)
    pickZone()
  }

  function mountGhost (el, { left, top, width, height }) {
    const g = el.cloneNode(true)
    g.removeAttribute('id')
    g.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'))
    g.classList.add('drag-ghost')
    Object.assign(g.style, {
      width: `${width}px`,
      height: `${height}px`,
      transform: `translate3d(${left}px, ${top}px, 0)`
    })
    document.body.appendChild(g)
    return g
  }

  function syncGhost (clientX, clientY) {
    if (!ghostEl || !drag) return
    // compositor-only path — not throttled, not tied to store/pickZone
    ghostEl.style.transform =
      `translate3d(${clientX - drag.offsetX}px, ${clientY - drag.offsetY}px, 0)`
  }

  function onPointerMove (e) {
    const d = drag
    if (!d || e.pointerId !== d.pointerId) return

    if (d.live) {
      e.preventDefault()
      d.moved = true
      syncGhost(e.clientX, e.clientY)
      move(e) // throttled: dropzone hit-testing only
      return
    }

    const dist = Math.hypot(e.clientX - d.startX, e.clientY - d.startY)

    if (d.needsHold) {
      if (!d.armed) {
        // 10px is too tight — finger/stylus jitter was cancelling the hold every time
        if (dist > SCROLL_SLOP) {
          clearTimeout(d.timer)
          d.abandoned = true
        }
      }
      // Once armed, activate() already ran (ghost visible); live path handles moves
      return
    }

    // Mouse: activate past slop, no hold
    if (dist <= SLOP) return
    e.preventDefault()
    activate()
    d.moved = true
    syncGhost(e.clientX, e.clientY)
    move(e)
  }

  function onPointerUp (e) {
    if (drag && e.pointerId === drag.pointerId) end(false)
  }

  function onPointerCancel (e) {
    if (drag && e.pointerId === drag.pointerId) end(true)
  }

  function onLostCapture (e) {
    if (!drag || e.pointerId !== drag.pointerId || !drag.live) return
    // Chrome/Boox often steals capture for pan — re-take it instead of aborting the drag
    try {
      drag.el.setPointerCapture(drag.pointerId)
    } catch {
      end(true)
    }
  }

  async function end (cancelled) {
    const d = drag
    if (!d) return
    drag = null // before releasePointerCapture so lostpointercapture doesn't re-enter
    clearTimeout(d.timer)
    if (d.el.hasPointerCapture?.(d.pointerId)) {
      try { d.el.releasePointerCapture(d.pointerId) } catch { /* already lost */ }
    }
    unlockScroll(d)

    if (!d.live) return
    if (!cancelled && d.moved) {
      suppressClick(d.el)
      pickZone()
      const id = get(bestDropzoneID)
      if (id) {
        // Keep ghost until snapshot re-render moves/removes the source; source stays fully visible
        const watch = watchSourceCaughtUp(d.el)
        const pending = zones.get(id)?.onDrop()
        playSound('tap', 0.125)
        await settleDrop(watch, pending)
        return
      }
    }
    reset()
  }

  async function settleDrop (watch, pending) {
    draggedItem.set(Empty())
    bestDropzoneID.set('')
    // Prefer the DOM signal (local snapshot → Svelte re-render). commit() often resolves
    // later (server ack), so awaiting it alone is both late and imprecise.
    try {
      await Promise.race([
        watch.promise,
        Promise.resolve(pending).catch(() => {}).then(() => tick()),
        sleep(2000)
      ])
    } finally {
      watch.cancel()
      clearVisuals()
    }
  }

  // Resolves when list/calendar re-render has applied the drop: source node
  // disconnected (moved across views) or translated (reordered in-place).
  function watchSourceCaughtUp (el) {
    if (!el?.isConnected) return { promise: Promise.resolve(), cancel: () => {} }

    const { top, left } = el.getBoundingClientRect()
    let settled = false
    let observer

    const cancel = () => {
      if (settled) return
      settled = true
      observer?.disconnect()
    }

    const promise = new Promise(resolve => {
      const finish = () => {
        cancel()
        resolve()
      }
      observer = new MutationObserver(() => {
        if (!el.isConnected) return finish()
        const next = el.getBoundingClientRect()
        if (next.top !== top || next.left !== left) finish()
      })
      observer.observe(document.body, { childList: true, subtree: true })
    })

    return { promise, cancel }
  }

  function sleep (ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  function preventScroll (e) {
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

  function updatePosition (e) {
    draggedItem.update(i => {
      i.x1 = e.clientX - i.offsetX
      i.y1 = e.clientY - i.offsetY
      i.x2 = i.x1 + i.width
      i.y2 = i.y1 + i.height
      return i
    })
    pickZone()
  }

  function pickZone () {
    const item = get(draggedItem)
    if (!item.id) {
      bestDropzoneID.set('')
      return
    }

    const matches = {}
    for (const [id, z] of zones) {
      const bottom = z.normalizeDragItemHeight ? item.y1 + NORMALIZED_HEIGHT : item.y2
      const box = { left: item.x1, top: item.y1, right: item.x2, bottom }
      const dropzone = intersect(z.node.getBoundingClientRect(), z.clipRectFunction())
      const hit = intersect(box, dropzone)
      if (hit.width > 0 && hit.height > 0) {
        matches[id] = { area: hit.width * hit.height, left: dropzone.left }
      }
    }
    bestDropzoneID.set(resolveBest(matches))
  }

  function resolveBest (matches) {
    let max = 0, best = ''
    for (const [id, { area, left }] of Object.entries(matches)) {
      if (area > max || (area === max && best && left > matches[best].left)) {
        max = area
        best = id
      }
    }
    return best
  }

  function clearVisuals () {
    ghostEl?.remove()
    ghostEl = null
  }

  function reset () {
    clearVisuals()
    draggedItem.set(Empty())
    bestDropzoneID.set('')
  }

  function Empty () {
    return {
      x1: null, y1: null, x2: null, y2: null,
      offsetX: null, offsetY: null, kind: '', id: ''
    }
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
    if (i === 0) {
      const top = rooms[0]
      return top ? top.orderValue / 1.1 : k
    }
    if (i === n) return rooms[n - 1].orderValue + k
    return (rooms[i - 1].orderValue + rooms[i].orderValue) / 2
  }

  function registerDropzone ({ clipRectFunction, id, onDrop, normalizeDragItemHeight = false }) {
    return (node) => {
      zones.set(id, { node, clipRectFunction, onDrop, normalizeDragItemHeight })
      if (get(draggedItem).id) pickZone()
      return () => {
        if (zones.get(id)?.node === node) zones.delete(id)
      }
    }
  }
</script>

<svelte:window
  onpointermove={onPointerMove}
  onpointerup={onPointerUp}
  onpointercancel={onPointerCancel}
  onlostpointercapture={onLostCapture}
/>

<div class="h-full">
  {@render children()}
</div>

<style>
  :global(.drag-ghost) {
    position: fixed;
    left: 0;
    top: 0;
    box-sizing: border-box;
    margin: 0;
    pointer-events: none;
    z-index: 10000;
    opacity: 0.45;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    will-change: transform;
  }
</style>
