<script>
  import { getContext } from 'svelte'
  import { pixelsPerHour } from '/src/routes/[user]/components/Calendar/store.js'
  import { getLocalY } from '$lib/utils/core.js'

  let { 
    task,
    isBulletPoint,
    height,
  } = $props()

  const dimensions = getContext('dimensions')
  const { Task } = getContext('app')

  let startY = 0

  function adjustDuration (e, task) {
    const minutesPerPixel = 60 * (1 / $pixelsPerHour)

    const newY = getLocalY(dimensions.appDiv, e.clientY)
    const durationChange = minutesPerPixel * (newY - startY)

    Task.update({
      id: task.id,
      kvChanges: {
        duration: Math.max(1, task.duration + durationChange)
      }
    })
  }
</script>

<div 
  draggable="true"
  ondragstart={e => startY = getLocalY(dimensions.appDiv, e.clientY)}
  ondragend={e => adjustDuration(e, task)}
  style="
    cursor: ns-resize;
    position: absolute;
    left: -3px; 
    bottom: {0}px;
    height: {height/12}px; 
    min-height: 3px;
    width: {isBulletPoint ? '20%' : '100%'}; 
  "
>
</div>