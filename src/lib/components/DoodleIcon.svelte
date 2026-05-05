<script>
  import { getContext } from 'svelte'

  const { openTaskPopup, Task } = getContext('app')
  const { startTaskDrag } = getContext('drag-drop')

  let { 
    iconTask, 
    size = '32px',
    extraStyle = '',
    whiteVariant = false,
    scaleToFit = false
  } = $props()

  let timer = null

  function onclick (e) {
    e.stopPropagation()
    toggleDone(iconTask)
   
    if (timer) { // double click
      openTaskPopup(iconTask)

      clearTimeout(timer)
      timer = null
    } 
    else timer = setTimeout(() => timer = null, 300)
  }

  function toggleDone (iconTask) {
    Task.update({ 
      id: iconTask.id, 
      kvChanges: { isDone: !iconTask.isDone }
    })
  }
</script>

<img {onclick}
  src={iconTask.iconURL}
  style="
    width: {size};
    height: {size};
    cursor: pointer;
    transform-origin: center;
    {extraStyle};
  "
  style:transform={scaleToFit ? 'scale(1.5)' : ''}
  class={[
    iconTask.isDone ? 'complete' : 'incomplete',
    whiteVariant && 'monochrome',
    'ios-reset select-none'
  ]}
  draggable="true"
  ondragstart={e => startTaskDrag({ e, id: iconTask.id, isFromCal: true })}
/>

<style>
  .ios-reset {
    -webkit-touch-callout: none; /* disable iOS 3D touch */
    touch-action: manipulation; /* disable double tap zoom, see https://x.com/JohnPhamous/status/1909293861547262141 */
  }

  .complete {
    filter: opacity(1.0);
  }

  .incomplete {
    filter: grayscale(100%) opacity(0.6);
  }

  .monochrome.complete {
    filter: brightness(0) invert(1);
  }
  .monochrome.incomplete {
    filter: brightness(0) invert(1) opacity(0.6);
  }
</style>