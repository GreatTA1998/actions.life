<script>
  import { pixelsPerHour } from '/src/routes/[user]/components/Calendar/store.js'
  import { minutes } from '$lib/utils/core.js'

  let { 
    task, 
    onChange = () => {},
    onInput = () => {}
  } = $props()

  let dragging = $state(false)
  let startY = 0
  let startDuration = 0
  let ppm = $derived($pixelsPerHour / 60)

  function onpointerdown (e) {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging = true
    startY = e.clientY
    startDuration = task.duration
  }

  function onpointermove (e) {
    if (dragging) {
      updateDuration(e)
    }
  }

  function onpointerup (e) {
    if (dragging) {
      updateDuration(e) // prevents setting duration to 0 on an immediate pointerdown -> pointerup
      onInput()
      dragging = false
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  function updateDuration (e) {
    const end = minutes(task.startTime) + startDuration + (e.clientY - startY) / ppm
    onChange(Math.max(1, end - minutes(task.startTime)))
  }
</script>

<div {onpointerdown} {onpointermove} {onpointerup}
  ontouchend={e => e.preventDefault()}
  class="absolute z-1 touch-none cursor-ns-resize top-auto bottom-0 inset-x-0"
  style:height="clamp(2px, {(task.duration * ppm) * 1/3}px, 24px)"
  style:transform="translateY(50%)"
></div>