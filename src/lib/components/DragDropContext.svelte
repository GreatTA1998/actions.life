<script>
  import { setContext } from 'svelte'
  import { on } from 'svelte/events'
  import { writable } from 'svelte/store'
  import { playSound } from '$lib/features/audio.js'
  import { TOUCH } from '$lib/utils/constants.js'

  let { children } = $props()

  const draggedItem = writable(empty())
  const bestDropzoneID = writable('')
  const scrollCalRect = writable(() => ({ left: 0, top: 0, right: Infinity, bottom: Infinity }))
  const logicAreaRect = writable(() => ({ left: 0, top: 0, right: Infinity, bottom: Infinity }))
  const dropPreviewCSS = `
    background-color: rgba(var(--drag-preview), 0.15);
    border: 1px dashed rgba(var(--drag-preview), 0.6);
  `

  const zones = new Map()
  let holdTimer = 0
  let ghost = null

  setContext('drag-drop', {
    draggedItem, bestDropzoneID, dropPreviewCSS, scrollCalRect, logicAreaRect,
    startMouseDrag, startTouchDrag, computeOrderValue, registerDropzone
  })

  function startMouseDrag ({ e, id }) {
    e.stopPropagation()
    draggedItem.set(initDrag(e.currentTarget, id, e.clientX, e.clientY))
  }

  function onmousemove (e) {
    if (!$draggedItem.id) return

    if ($draggedItem.active) {
      e.preventDefault()
      track(e.clientX, e.clientY)
    }

    else if (Math.hypot(e.clientX - $draggedItem.sx, e.clientY - $draggedItem.sy) > 2) { // minimum required distance
      activate()
      track(e.clientX, e.clientY)
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
    const [touch] = e.changedTouches
    draggedItem.set(initDrag(e.currentTarget, id, touch.clientX, touch.clientY, touch.identifier))
    holdTimer = setTimeout(activate, TOUCH.HOLD_MS)
  }

  function ontouchmove (e) {
    if (!$draggedItem.id) return
    const touch = sameTouch(e.touches)
    if (!touch) return

    if ($draggedItem.active) {
      e.preventDefault()
      track(touch.clientX, touch.clientY)
    }

    else if (Math.hypot(touch.clientX - $draggedItem.sx, touch.clientY - $draggedItem.sy) > TOUCH.SLOP) {
      clearTimeout(holdTimer)
      draggedItem.set(empty())
    }
  }

  function ontouchend (e) {
    if (sameTouch(e.touches)) return
    else {
      if ($draggedItem.active) drop()
      reset()
    }
  }

  function ontouchcancel (e) {
    if (sameTouch(e.touches)) return
    reset()
  }

  function initDrag (el, id, clientX, clientY, tid = -1) {
    const { left, top } = el.getBoundingClientRect()
    return {
      el, id, tid, 
      active: false, 
      sx: clientX, sy: clientY,
      offsetX: clientX - left, offsetY: clientY - top,
      x1: 0, y1: 0, x2: 0, y2: 0, 
      width: 0, height: 0
    }
  }

  function activate () {
    if (!$draggedItem.id || $draggedItem.active) return
    clearTimeout(holdTimer)

    const source = $draggedItem.el
    const { width, height } = source.getBoundingClientRect()
    const x1 = $draggedItem.sx - $draggedItem.offsetX, y1 = $draggedItem.sy - $draggedItem.offsetY
    draggedItem.set({ ...$draggedItem, active: true, width, height, x1, y1, x2: x1 + width, y2: y1 + height })
    bestDropzoneID.set('')

    const clone = source.cloneNode(true)
    clone.removeAttribute('id')
    clone.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'))
    Object.assign(clone.style, { width: '100%', height: '100%', margin: '0' })
    ghost.style.borderRadius = getComputedStyle(source).borderRadius
    ghost.replaceChildren(clone)
    ghost.showPopover()
    pickZone()
  }

  function track (clientX, clientY) {
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
    clearTimeout(holdTimer)
    ghost.hidePopover()
    draggedItem.set(empty())
    bestDropzoneID.set('')
  }

  function pickZone () {
    let best = '', max = 0, bestLeft = -Infinity
    for (const [id, z] of zones) {
      const bottom = z.normalizeDragItemHeight ? $draggedItem.y1 + 12 : $draggedItem.y2
      const zone = intersect(z.node.getBoundingClientRect(), z.clipRectFunction())
      const hit = intersect({ left: $draggedItem.x1, top: $draggedItem.y1, right: $draggedItem.x2, bottom }, zone)
      if (hit.width <= 0 || hit.height <= 0) continue // negative values
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
      return () => zones.delete(id)
    }
  }

  function empty () {
    return { id: '', el: null, tid: -1, sx: 0, sy: 0, offsetX: 0, offsetY: 0, active: false, x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0 }
  }

  function sameTouch (list) {
    return [...list].find(t => t.identifier === $draggedItem.tid)
  }

  function computeOrderValue (i, rooms) {
    const n = rooms.length
    if (i === 0) return rooms[0] ? rooms[0].orderValue / 1.1 : 1
    if (i === n) return rooms[n - 1].orderValue + 1
    return (rooms[i - 1].orderValue + rooms[i].orderValue) / 2
  }
</script>

<div class="h-full" {onmousemove} {onmouseup} 
  {@attach node => on(node, 'touchmove', ontouchmove, { passive: false })} 
  {ontouchend} {ontouchcancel}
>
  {@render children()}
</div>

<div
  bind:this={ghost}
  popover="manual"
  class={['top-0 left-0 pointer-events-none opacity-50 shadow-[0_8px_24px_rgba(0,0,0,0.12)]']}
  style:width="{$draggedItem.width}px"
  style:height="{$draggedItem.height}px"
  style:transform="translate3d({$draggedItem.x1}px, {$draggedItem.y1}px, 0)"
></div>