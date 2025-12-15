<script>
  import Calendar from '/src/routes/[user]/components/Calendar/Calendar.svelte'
  import ListsArea from '/src/routes/[user]/components/ListsArea/ListsArea.svelte'
  import GripHandle from '$lib/components/GripHandle.svelte'
  import { updateFirestoreDoc } from '$lib/db/helpers.js'
  import { getContext, onMount, tick } from 'svelte'

  let { 
    orientation = 'horizontal',
    minLength = 0
  } = $props()

  const { user } = getContext('app')
  const { logicAreaRect } = getContext('drag-drop')
 
  let containerLength = $state(window.innerWidth) // rename to axis length
  let listAreaLength = $state(
    Math.max(
      minLength,
      $user.listAreaWidthRatio * 100 * window.innerWidth
    )
  )

  onMount(async () => {
    await tick() // computed sizes from `style` CSS are not ready yet
    logicAreaRect.set(
      () => document.querySelector('.list-area-container').getBoundingClientRect()
    )
  })

  function handlePointerDown (e) {
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  function handlePointerMove (e) {
    listAreaLength = Math.max(
      minLength, 
      Math.min(axisValue(e), containerLength)
    )
  }

  function handlePointerUp (e) {
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)

    updateFirestoreDoc(`/users/${$user.uid}`, {
      listAreaWidthRatio: (listAreaLength / containerLength) / 100
    })
  }

  function axisValue (e) {
    return orientation === 'horizontal' ? e.clientX : e.clientY
  }
</script>

<div class="relative flexbox container" style:flex-direction={orientation === 'horizontal' ? 'row' : 'column-reverse'}>
  <div class="list-area-container hide-scrollbar" 
    style="flex: 0 0 {listAreaLength}px;"
  >    
    <ListsArea />
  </div>
  
  <!-- touch-action: none is magic for some reason, suddenly fixed everything without even needing e.preventDefault() -->
  <div class="relative flexbox z-1 content-center" style="height: 100%; touch-action: none;">
    <GripHandle on:pointerdown={handlePointerDown}
      orientation={orientation === 'horizontal' ? 'vertical' : 'horizontal'} 
    />
  </div>

  <div class="calendar-container">
    <Calendar />
  </div>
</div>

<style>
  .container {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .list-area-container { /* THIS IS THE SCROLLING CONTAINER */
    overflow-y: auto;
    background-color: var(--todo-list-bg-color, #f5f5f5);
    position: relative;
  }
  
  .calendar-container {
    flex: 1; /* flex-grow: 1; */
    view-transition-name: calendar; 
    contain: layout;
  }
</style>