<script>
  import { getContext } from 'svelte'

  const { openTaskPopup, Task } = getContext('app')
  const { startTaskDrag } = getContext('drag-drop')

  let { 
    iconTask, 
    size = 32, // number => px, or any CSS length string (e.g. '1em')
    extraStyle = ''
  } = $props()

  let cssSize = $derived(typeof size === 'number' ? `${size}px` : size)

  let timer
  let delay = 300

  function onclick (e) {
    e.stopPropagation()
    toggleDone(iconTask)
   
    if (timer) { // double click
      openTaskPopup(iconTask)

      clearTimeout(timer)
      timer = null
    } 
    else timer = setTimeout(() => timer = null, delay)
  }

  function toggleDone (iconTask) {
    Task.update({ 
      id: iconTask.id, 
      kvChanges: { isDone: !iconTask.isDone }
    })
  }
</script>

<img
  {onclick}
  src={iconTask.iconURL}
  class:clearly-visible={iconTask.isDone}
  class:task-not-done={!iconTask.isDone}
  style="
    display: block; 
    width: {cssSize}; 
    height: {cssSize}; 
    cursor: pointer;
    transform-origin: center;
    {extraStyle};
  "
  class="ios-3d-touch-disable select-none mobile-no-double-tap-zoom"
  draggable="true"
  ondragstart={e => startTaskDrag({ e, id: iconTask.id, isFromCal: true })}
/>

<style>
  .ios-3d-touch-disable {
    -webkit-touch-callout: none;
  }

  .mobile-no-double-tap-zoom {
    touch-action: manipulation; /* see https://x.com/JohnPhamous/status/1909293861547262141 */
  }
</style>
