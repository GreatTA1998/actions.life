<script>
  import { onDestroy, setContext, getContext } from 'svelte'
  import { writable } from 'svelte/store'
  import { playSound } from '$lib/features/audio.js'
  import { TOUCH } from '$lib/utils/constants.js'

  let { children } = $props()

  const { Task } = getContext('app')
  const draggedItem = writable(empty())
  const bestDropzoneID = writable('')
  const scrollCalRect = writable(() => ({ left: 0, top: 0, right: Infinity, bottom: Infinity }))
  const dropPreviewCSS = `
    background-color: rgba(var(--drag-preview), 0.15);
    border: 1px dashed rgba(var(--drag-preview), 0.6);
  `

  const zones = new Map()
  let holdTimer = 0
  let ghost = null
  let unsub = []
  const PROBE_H = 2 // for targetting the smallest dropzone (4px in TaskElement's TodoList)

  setContext('drag-drop', {
    draggedItem, bestDropzoneID, dropPreviewCSS, scrollCalRect,
    startMouseDrag, startTouchDrag, computeOrderValue, registerDropzone,
    placeOnList, placeOnCal
  })

  onDestroy(reset)

  function startMouseDrag ({ e, id }) {
    e.stopPropagation()
    if ($draggedItem.id) return
    arm(e.currentTarget, id, e.clientX, e.clientY)
    listen(window, 'mousemove', onmousemove)
    listen(window, 'mouseup', onmouseup)
  }

  function onmousemove (e) {
    if (!$draggedItem.id) return
    if ($draggedItem.active) {
      e.preventDefault()
      hitTest(e.clientX, e.clientY)
    }
    else if (Math.hypot(e.clientX - $draggedItem.sx, e.clientY - $draggedItem.sy) > 2) {
      activate()
      hitTest(e.clientX, e.clientY)
    }
  }

  function onmouseup () {
    if ($draggedItem.active) {
      drop()
      function swallow (e) {
        e.stopImmediatePropagation()
      }
      document.addEventListener('click', swallow, true)
      setTimeout(() => document.removeEventListener('click', swallow, true), 50)
    }
    reset()
  }

  function startTouchDrag ({ e, id }) {
    e.stopPropagation()
    if ($draggedItem.id) return
    const [touch] = e.changedTouches
    arm(e.currentTarget, id, touch.clientX, touch.clientY)
    holdTimer = setTimeout(activate, TOUCH.HOLD_MS)
    listen(window, 'touchmove', ontouchmove, { passive: false })
    listen(window, 'touchend', ontouchend)
    listen(window, 'touchcancel', reset)
  }

  function ontouchmove (e) {
    if (!$draggedItem.id) return
    const [touch] = e.touches
    if ($draggedItem.active) {
      e.preventDefault()
      hitTest(touch.clientX, touch.clientY)
    }
    else if (Math.hypot(touch.clientX - $draggedItem.sx, touch.clientY - $draggedItem.sy) > TOUCH.SLOP) {
      reset()
    }
  }

  function ontouchend () {
    if ($draggedItem.active) drop()
    reset()
  }

  function originOf (el) {
    return el.closest('[data-drag-origin]')?.dataset.dragOrigin ?? 'list'
  }

  function arm (el, id, x, y) {
    const { left, top } = el.getBoundingClientRect()
    draggedItem.set({
      ...empty(),
      el, id, origin: originOf(el),
      sx: x, sy: y,
      offsetX: x - left, offsetY: y - top
    })
  }

  function activate () {
    const item = $draggedItem
    if (!item.id || item.active) return
    clearTimeout(holdTimer)

    const source = item.el
    const { width, height } = source.getBoundingClientRect()
    const x1 = item.sx - item.offsetX, y1 = item.sy - item.offsetY
    draggedItem.set({ ...item, active: true, width, height, x1, y1, x2: x1 + width, y2: y1 + height })

    const clone = source.cloneNode(true)
    clone.removeAttribute('id')
    clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'))
    Object.assign(clone.style, { width: '100%', height: '100%', margin: '0' })
    ghost.style.borderRadius = getComputedStyle(source).borderRadius
    ghost.replaceChildren(clone)
    ghost.showPopover()
    pickZone()
  }

  function hitTest (clientX, clientY) {
    const x1 = clientX - $draggedItem.offsetX, y1 = clientY - $draggedItem.offsetY
    draggedItem.update(i => {
      i.x1 = x1; i.y1 = y1
      i.x2 = x1 + i.width; i.y2 = y1 + i.height
      return i
    })
    pickZone()
  }

  function drop () {
    pickZone()
    const zone = zones.get($bestDropzoneID)
    if (zone) {
      zone.onDrop()
      playSound('tap', 0.125)
    }
  }

  function reset () {
    unlisten()
    clearTimeout(holdTimer)
    ghost?.hidePopover()
    draggedItem.set(empty())
    bestDropzoneID.set('')
  }

  function listen (target, type, handler, options) {
    target.addEventListener(type, handler, options)
    unsub.push(() => target.removeEventListener(type, handler, options))
  }

  function unlisten () {
    for (const off of unsub) off()
    unsub = []
  }

  function overflowParents (node) {
    const clips = []
    for (let p = node.parentElement; p && p !== document.documentElement; p = p.parentElement) {
      const { overflow, overflowX, overflowY } = getComputedStyle(p)
      if (overflow !== 'visible' || overflowX !== 'visible' || overflowY !== 'visible') clips.push(p)
    }
    return clips
  }

  function visibleRect (zone) {
    let r = zone.node.getBoundingClientRect()
    for (const el of zone.clips) r = intersect(r, el.getBoundingClientRect())
    return intersect(r, zone.clipRectFunction())
  }

  function insideDragged (node) {
    const id = $draggedItem.id
    return id && node.closest(`[data-task-id="${CSS.escape(id)}"]`)
  }

  function pickZone () {
    const { x1, y1, x2 } = $draggedItem
    const hits = []
    for (const [id, zone] of zones) {
      if (zone.ignoreIf()) continue
      if (insideDragged(zone.node)) continue
      const clippedZone = visibleRect(zone)
      const hit = intersect({ left: x1, top: y1, right: x2, bottom: y1 + PROBE_H }, clippedZone)
      if (hit.width <= 0 || hit.height <= 0) continue
      hits.push({ id, node: zone.node, area: hit.width * hit.height, left: clippedZone.left })
    }

    let best = '', max = 0, bestLeft = -Infinity
    for (const h of hits) {
      if (hits.some(o => h.node !== o.node && h.node.contains(o.node))) continue
      if (h.area > max || (h.area === max && h.left > bestLeft)) {
        max = h.area
        best = h.id
        bestLeft = h.left
      }
    }
    if (best !== $bestDropzoneID) bestDropzoneID.set(best)
  }

  function intersect (a, b) {
    const left = Math.max(a.left, b.left), top = Math.max(a.top, b.top)
    const right = Math.min(a.right, b.right), bottom = Math.min(a.bottom, b.bottom)
    return { left, top, right, bottom, width: right - left, height: bottom - top }
  }

  function registerDropzone ({ clipRectFunction, id, onDrop, ignoreIf = () => false }) {
    return (node) => {
      zones.set(id, { node, clips: overflowParents(node), clipRectFunction, onDrop, ignoreIf })
      return () => zones.delete(id)
    }
  }

  function empty () {
    return { id: '', el: null, origin: 'list', sx: 0, sy: 0, offsetX: 0, offsetY: 0, active: false, x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0 }
  }

  function computeOrderValue (i, rooms) {
    const n = rooms.length
    if (i === 0) return rooms[0] ? rooms[0].orderValue / 1.1 : 1
    if (i === n) return rooms[n - 1].orderValue + 1
    return (rooms[i - 1].orderValue + rooms[i].orderValue) / 2
  }

  function placeOnList ({ parentID, rooms, index, unschedule = false }) {
    const kvChanges = {
      parentID,
      orderValue: computeOrderValue(index, rooms),
      onList: true
    }
    if (unschedule || $draggedItem.origin !== 'list') {
      kvChanges.startTime = ''
      kvChanges.startDateISO = ''
    }
    return Task.update({ id: $draggedItem.id, kvChanges })
  }

  function placeOnCal ({ startDateISO, startTime }) {
    const kvChanges = { startDateISO, startTime }
    if ($draggedItem.origin === 'nested-cal') kvChanges.parentID = ''
    return Task.update({ id: $draggedItem.id, kvChanges })
  }
</script>

<div class="h-full">
  {@render children()}
</div>

<div
  bind:this={ghost}
  popover="manual"
  class="my-drag-image top-0 left-0 opacity-50 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
  style:width="{$draggedItem.width}px"
  style:height="{$draggedItem.height}px"
  style:transform="translate3d({$draggedItem.x1}px, {$draggedItem.y1}px, 0)"
></div>

<style>
  .my-drag-image {
    pointer-events: none;
    overflow: hidden;
    background: transparent;
  }
</style>
