<script>
  import { pixelsPerHour } from '/src/routes/[user]/components/Calendar/store.js'
  import { minutes } from '$lib/utils/core.js'

  let { 
    task, 
    onChange = () => {},
    onInput = () => {}
  } = $props()

  let armed = $state(false)
  let startY = 0
  let lastY = 0
  let startDuration = 0
  let holdTimer
  let ppm = $derived($pixelsPerHour / 60)

  const HOLD_MS = 300
  const TOUCH_SLOP = 10

  // Non-passive: iOS will otherwise start a native scroll after arm.
  function claimTouch (e) {
    if (armed) e.preventDefault()
  }

  function arm (target, pointerId) {
    armed = true
    startY = lastY
    target.style.touchAction = 'none'
    target.setPointerCapture(pointerId)
    document.addEventListener('touchmove', claimTouch, { passive: false, capture: true })
  }

  function disarm (target) {
    document.removeEventListener('touchmove', claimTouch, { capture: true })
    if (target) target.style.touchAction = ''
    armed = false
  }

  function cancelHold () {
    clearTimeout(holdTimer)
    holdTimer = null
  }

  function onpointerdown (e) {
    startY = lastY = e.clientY
    startDuration = task.duration

    if (e.pointerType !== 'touch') {
      e.preventDefault()
      arm(e.currentTarget, e.pointerId)
      return
    }

    const { currentTarget, pointerId } = e
    holdTimer = setTimeout(() => arm(currentTarget, pointerId), HOLD_MS)
  }

  function onpointermove (e) {
    lastY = e.clientY
    if (!armed) {
      if (Math.abs(lastY - startY) > TOUCH_SLOP) cancelHold()
      return
    }
    e.preventDefault()
    updateDuration(lastY)
  }

  function finishPointer (e, { commit }) {
    cancelHold()
    if (armed) {
      if (commit) {
        updateDuration(lastY)
        onInput()
        suppressGhostClick()
      } else {
        onChange(0) // clear previewDuration (falsy → falls back to task.duration)
      }
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    }
    disarm(e.currentTarget)
  }

  function updateDuration (clientY) {
    const end = minutes(task.startTime) + startDuration + (clientY - startY) / ppm
    onChange(Math.max(1, end - minutes(task.startTime)))
  }
</script>

<div
  {onpointerdown} {onpointermove}
  onpointerup={e => finishPointer(e, { commit: true })}
  onpointercancel={e => finishPointer(e, { commit: false })}
  ontouchend={e => claimTouch(e)}
  class="absolute z-1 cursor-ns-resize bottom-0 inset-x-0"
  style:height="clamp(2px, {(task.duration * ppm) * 1/3}px, 24px)"
  style:transform="translateY(50%)"
></div>

{#if armed}
  <div
    class="pointer-events-none absolute bottom-0 inset-x-0 z-1 h-px"
    style:background="rgba(var(--drag-preview), 0.85)"
  ></div>
{/if}