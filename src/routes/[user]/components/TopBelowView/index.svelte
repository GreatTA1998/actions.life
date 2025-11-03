<script>
  import TodoList from '../ListsArea/TodoList.svelte'
  import Calendar from '../Calendar/Calendar.svelte'
  import GripHandle from '$lib/components/GripHandle.svelte'

  import { user } from '$lib/store'
  import { updateFirestoreDoc } from '$lib/db/helpers.js'
  import { getContext, onMount, tick } from 'svelte'

  const { logicAreaRect } = getContext('drag-drop')

  let isResizing = false
  let startY = 0
  let startHeight = 0
  let containerHeight = 0
  let listAreaHeight = 0
  let containerElement

  function getContainerHeight () {
    return containerElement?.getBoundingClientRect().height || window.innerHeight
  }

  function getInitialHeight () {
    const height = getContainerHeight()
    if ($user.listAreaHeightRatio && height > 0) {
      return ($user.listAreaHeightRatio * 100 * height)
    } else {
      // Default to ~40% of container height
      return height * 0.4
    }
  }

  onMount(async () => {
    await tick() // there's a danger that `style` isn't fully applied during onMount
    containerHeight = getContainerHeight()
    listAreaHeight = getInitialHeight()
    logicAreaRect.set(
      () => document.querySelector('.top-below-container').getBoundingClientRect()
    )
  })

  function handlePointerDown (e) {
    isResizing = true
    startY = e.clientY
    startHeight = listAreaHeight
    
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none'
    // Capture pointer to ensure events fire even when moved outside window
    e.target.setPointerCapture(e.pointerId)
  }

  function handlePointerMove (e) {
    if (!isResizing) return

    const deltaY = e.clientY - startY
    const maxHeight = getContainerHeight()
    const iPhoneHomeSwipeBuffer = 48
    const newHeight = Math.max(
      iPhoneHomeSwipeBuffer, 
      Math.min(
        maxHeight, 
        startHeight + deltaY
      )
    )
    listAreaHeight = newHeight
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

    const containerHeight = getContainerHeight()
    updateFirestoreDoc(`/users/${$user.uid}`, {
      listAreaHeightRatio: (listAreaHeight / containerHeight) / 100
    })
  }
</script>

<div class="top-below-container" bind:this={containerElement}>
  <div class="calendar-container" style="height: {listAreaHeight}px;">
    <Calendar />
  </div>

  <div class="handle-wrapper">
    <GripHandle orientation="horizontal" on:pointerdown={handlePointerDown}/>
  </div>

  <div class="list-container">    
    <TodoList cssStyle="background-color: transparent; padding-top: var(--main-content-top-margin);"
      isLargeFont
      listWidth="100%"
    />
  </div>
</div>

<style>
  .top-below-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }
  
  .calendar-container { /* THIS IS THE SCROLLING CONTAINER */
    width: 100%;
    overflow-y: auto;
    scrollbar-width: none;
    background-color: var(--todo-list-bg-color, #f5f5f5);
    position: relative;
    flex-shrink: 0;
  }
  
  .list-container {
    flex-grow: 1;
    width: 100%;
    overflow-y: auto;
    min-height: 48px;
    padding: 0 8px;
  }
  
  .handle-wrapper {
    position: relative;
    width: 100%;
    height: 12px; /* Minimal height - actual touch target is the 48px resize-fab */
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    /* this is magic for some reason, suddenly fixed everything without even needing e.preventDefault() */
    touch-action: none;
  }
</style>

