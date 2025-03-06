<script>
  import { activeDragItem, grabOffset, openDetailedCard } from '/src/store'
  import { createEventDispatcher } from 'svelte'

  export let iconTask

  let timer
  let delay = 200

  const dispatch = createEventDispatcher()

  function handleSingleOrDoubleClick() {
    if (timer) {
      clearTimeout(timer)
      timer = null

      dispatch('task-update', { 
        id: iconTask.id, 
        keyValueChanges: {
          isDone: !iconTask.isDone
        }
      })
    } 
    else {
      timer = setTimeout(() => {
        openDetailedCard(iconTask)

        timer = null
      }, delay)
    }
  }

  function startDragMove(e, id) {
    e.dataTransfer.setData('text/plain', id)

    const rect = e.target.getBoundingClientRect()
    grabOffset.set(e.clientY - rect.top)

    activeDragItem.set({ kind: 'room', ...iconTask })
  }
</script>

<div style="position: relative;">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-missing-attribute -->
  <img
    on:click|stopPropagation={handleSingleOrDoubleClick}
    src={iconTask.iconURL}
    class:clearly-visible={iconTask.isDone}
    class:task-not-done={!iconTask.isDone}
    style="width: 32px; height: 32px; border: 0px solid blue; cursor: pointer;"
    class:radial-glow={iconTask.isDone}
    class="ios-3d-touch-disable unselectable"
    draggable="true"
    on:dragstart|self={(e) => startDragMove(e, iconTask.id)}
  />
</div>

<style>
  .ios-3d-touch-disable {
    -webkit-touch-callout: none;
  }

  .task-not-done {
    filter: grayscale(80%) opacity(0.8) blur(0.8px);
  }

  .clearly-visible {
    opacity: 1;
  }
</style>
