<script>
  import ListsArea from '../ListsArea/ListsArea.svelte'
  import Calendar from '../Calendar/Calendar.svelte'
  import GripHandle from './GripHandle.svelte'

  import { user } from '$lib/store'
  import { updateFirestoreDoc } from '$lib/db/helpers.js'
  import { getContext, onMount, tick } from 'svelte'

  const { logicAreaRect } = getContext('drag-drop')

  let isResizing = false
  let startX = 0
  let startWidth = 0
  let listAreaWidth = getInitialWidth()

  onMount(async () => {
    await tick() // there's a danger that `style` isn't fully applied onMount
    logicAreaRect.set(
      () => document.querySelector('.side-by-side-container').getBoundingClientRect()
    )
  })

  function getInitialWidth () {
    if ($user.listAreaWidthRatio) {
      return ($user.listAreaWidthRatio * 100 * window.innerWidth)
    } else {
      return 360
    }
  }

  function handlePointerDown (e) {
    isResizing = true
    startX = e.clientX
    startWidth = listAreaWidth
    
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none'
    // Capture pointer to ensure events fire even when moved outside window
    e.target.setPointerCapture(e.pointerId)
  }

  function handlePointerMove (e) {
    if (!isResizing) return

    const deltaX = e.clientX - startX
    const newWidth = Math.max(
      0, 
      Math.min(
        window.innerWidth, 
        startWidth + deltaX
      )
    )
    listAreaWidth = newWidth
  }

  function handlePointerUp (e) {
    isResizing = false
    
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
    
    document.body.style.userSelect = ''

    // Release pointer capture
    if (e.target.hasPointerCapture(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId)
    }

    updateFirestoreDoc(`/users/${$user.uid}`, {
      listAreaWidthRatio: (listAreaWidth / window.innerWidth) / 100
    })
  }
</script>

<div class="side-by-side-container">
  <div class="list-area-container" style="width: {listAreaWidth}px;">    
    <ListsArea />
  </div>
  
  <div class="handle-wrapper">
    <GripHandle on:pointerdown={handlePointerDown}/>
  </div>

  <div class="calendar-container">
    <Calendar />
  </div>
</div>

<style>
  .side-by-side-container {
    display: flex;
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }
  
  .list-area-container { /* THIS IS THE SCROLLING CONTAINER */
    height: 100%;
    overflow-y: auto;
    scrollbar-width: none;
    background-color: var(--todo-list-bg-color, #f5f5f5);
    position: relative;
    flex-shrink: 0;
  }
  
  .calendar-container {
    flex-grow: 1;
    height: 100%;
    overflow: hidden;
  }
  
  .handle-wrapper {
    position: relative;
    height: 100%;
    z-index: 1;
    display: flex;
    align-items: center;

    /* this is magic for some reason, suddenly fixed everything without even needing e.preventDefault() */
    touch-action: none;
  }
</style> 