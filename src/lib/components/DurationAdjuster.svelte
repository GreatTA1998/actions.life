<script>
  import { pixelsPerHour } from '/src/routes/[user]/components/Calendar/store.js'
  import { playSound } from '$lib/features/audio.js'

  let { 
    task, 
    onChange = () => {},
    onInput = () => {}
  } = $props()

  let activated = $state(false)
  let startY = 0
  let prevY = 0
  let activationTimer

  function onpointerdown (e) {
    e.currentTarget.setPointerCapture(e.pointerId)
    startY = prevY = e.clientY

    if (e.pointerType === 'touch') {
      activationTimer = setTimeout(activate, 300)
    } else {
      e.preventDefault()
      activate()
    }
  }

  function onpointermove (e) {
    prevY = e.clientY
    if (activated) {
      e.preventDefault()
      updateDuration(prevY)
    } else if (Math.abs(prevY - startY) > 10) { // touch slop
      clearTimeout(activationTimer)
    }
  }

  function onpointerup (e) {
    if (activated) {
      updateDuration(prevY) // we use prevY so the finger lift's `e.clientY` doesn't mess up the alignment
      onInput()
      playSound('tap', 0.125)
    }
    onpointercancel(e)
  }

  // critical on iOS, fires whenever pointer movement leads to scroll
  // which means `onpointerup` will never fire to abort the activation timer / release the pointer
  function onpointercancel (e) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    deactivate(e)
    clearTimeout(activationTimer)
  }

  function activate () {
    activated = true
    document.addEventListener('touchmove', preventTouchScroll, { passive: false, capture: true })
  }

  function deactivate () {
    activated = false
    document.removeEventListener('touchmove', preventTouchScroll, { capture: true })
  }

  function preventTouchScroll (e) {
    e.preventDefault()
  }

  function updateDuration (clientY) {
    onChange(Math.max(1, task.duration + (clientY - startY) / ($pixelsPerHour / 60)))
  }
</script>

<div
  {onpointerdown} {onpointermove} {onpointerup} {onpointercancel}
  class="absolute z-1 cursor-ns-resize bottom-0 inset-x-0"
  style:height="clamp(2px, {(task.duration * ($pixelsPerHour / 60)) * 1/3}px, 24px)"
  style:transform="translateY(50%)"
></div>

{#if activated}
  <div class="pointer-events-none absolute bottom-0 inset-x-0 z-1 h-px"
    style:background="rgba(var(--drag-preview), 0.85)"
  ></div>
{/if}