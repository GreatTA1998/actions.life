<script>
  import { pixelsPerHour } from '/src/routes/[user]/components/Calendar/store.js'
  import { minutes, createThrottledFunction } from '$lib/utils/core.js'

  let { 
    task, 
    onChange = () => {},
    onInput = () => {}
  } = $props()

  let isDragging = $state(false)
  let startY = 0
  let startDuration = 0
  let ppm = $derived($pixelsPerHour / 60)

  const throttledUpdate = createThrottledFunction(updateDuration, 1000/60)

  function onpointerdown (e) {
    e.stopPropagation()
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    isDragging = true
    startY = e.clientY
    startDuration = task.duration
  }

  function onpointermove (e) {
    if (!isDragging) return
    throttledUpdate(e)
  }

  function updateDuration (e) {
    const end = minutes(task.startTime) + startDuration + (e.clientY - startY) / ppm
    onChange(Math.max(1, end - minutes(task.startTime)))
  }

  function onpointerup (e) {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    if (isDragging) {
      updateDuration(e)
      onInput()
    }
    isDragging = false
  }
</script>

<div {onpointerdown} {onpointermove} {onpointerup}
  class="absolute z-1 touch-none cursor-ns-resize top-auto bottom-0 inset-x-0"
  style:height="clamp(4px, {(task.duration * ppm) * 1/5}px, 24px)"
></div>