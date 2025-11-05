<script>
  import { getContext } from 'svelte'

  const { openTaskPopup, Task } = getContext('app')
  const { startTaskDrag } = getContext('drag-drop')

  let { 
    iconTask, 
    size = 32 // default for backward compatibility
  } = $props()

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
      keyValueChanges: { isDone: !iconTask.isDone }
    })
  }
</script>

<div style="position: relative;">
  <img
    {onclick}
    src={iconTask.iconURL}
    class:clearly-visible={iconTask.isDone}
    class:task-not-done={!iconTask.isDone}
    style="display: block; width: {size}px; height: {size}px; border: 0px solid blue; cursor: pointer;"
    class:radial-glow={iconTask.isDone}
    class="ios-3d-touch-disable unselectable mobile-no-double-tap-zoom"
    draggable="true"
    ondragstart={e => startTaskDrag({ e, id: iconTask.id, isFromCal: true })}
  />
</div>

<style>
  .ios-3d-touch-disable {
    -webkit-touch-callout: none;
  }

  .mobile-no-double-tap-zoom {
    touch-action: manipulation; /* see https://x.com/JohnPhamous/status/1909293861547262141 */
  }

  .task-not-done {
    filter: grayscale(80%) opacity(0.8) blur(0.8px);
  }

  .clearly-visible {
    opacity: 1;
  }
</style>
