<script>
  import TodoList from '../ListsArea/TodoList.svelte'
  import Calendar from '../Calendar/Calendar.svelte'
  import GripHandle from '$lib/components/GripHandle.svelte'

  import { user } from '$lib/store'
  import { updateFirestoreDoc } from '$lib/db/helpers.js'
  import { getContext, onMount, tick } from 'svelte'

  const { logicAreaRect } = getContext('drag-drop')
  
  const HANDLE_HEIGHT = 12
  const MIN_LIST_HEIGHT = 48 // Minimum height to avoid iOS home gesture conflict
  const DEFAULT_CALENDAR_RATIO = 0.4

  let isResizing = false
  let startY = 0
  let startListHeight = 0
  let calendarHeight = 0
  let containerElement

  function getContainerHeight () {
    return containerElement?.getBoundingClientRect().height || window.innerHeight
  }

  function getInitialCalendarHeight () {
    const height = getContainerHeight()
    if ($user.listAreaHeightRatio && height > 0) {
      return $user.listAreaHeightRatio * 100 * height
    }
    return height * DEFAULT_CALENDAR_RATIO
  }

  $: listAreaHeight = getContainerHeight() - calendarHeight - HANDLE_HEIGHT

  onMount(async () => {
    await tick()
    calendarHeight = getInitialCalendarHeight()
    logicAreaRect.set(
      () => document.querySelector('.top-below-container').getBoundingClientRect()
    )
  })

  function handlePointerDown (e) {
    isResizing = true
    startY = e.clientY
    startListHeight = listAreaHeight
    
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none'
    // Capture pointer to ensure events fire even when moved outside window
    e.target.setPointerCapture(e.pointerId)
  }

  function handlePointerMove (e) {
    if (!isResizing) return

    const deltaY = startY - e.clientY
    const totalHeight = getContainerHeight()
    const maxListHeight = totalHeight - HANDLE_HEIGHT
    
    const newListHeight = Math.max(
      MIN_LIST_HEIGHT,
      Math.min(maxListHeight, startListHeight + deltaY)
    )
    
    calendarHeight = totalHeight - newListHeight - HANDLE_HEIGHT
  }

  function handlePointerUp (e) {
    isResizing = false
    
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
    document.body.style.userSelect = ''

    if (e.target.hasPointerCapture(e.pointerId)) {
      e.target.releasePointerCapture(e.pointerId)
    }

    const containerHeight = getContainerHeight()
    updateFirestoreDoc(`/users/${$user.uid}`, {
      listAreaHeightRatio: (calendarHeight / containerHeight) / 100
    })
  }
</script>

<div class="top-below-container" bind:this={containerElement}>
  <div class="calendar-container" style="height: {calendarHeight}px;">
    <Calendar />
  </div>

  <div class="handle-wrapper">
    <GripHandle orientation="horizontal" on:pointerdown={handlePointerDown}/>
  </div>

  <div class="list-container" style="height: {listAreaHeight}px;">    
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
    overscroll-behavior: contain;
    scrollbar-width: none;
    background-color: var(--todo-list-bg-color, #f5f5f5);
    position: relative;
    flex-shrink: 0;
  }
  
  .list-container {
    width: 100%;
    overflow-y: auto;
    overscroll-behavior: contain;
    min-height: 48px;
    padding: 0 8px;
    flex-shrink: 0;
  }
  
  .handle-wrapper {
    position: relative;
    width: 100%;
    height: 12px;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    touch-action: none;
  }
</style>

