<script>
  import ListsArea from '../ListsArea/ListsArea.svelte'
  import Calendar from '../Calendar/Calendar.svelte'
  import GripHandle from './GripHandle.svelte'

  import { user } from '/src/lib/store'
  import { updateFirestoreDoc } from '/src/lib/db/helpers.js'

  let isResizing = false
  let startX = 0
  let startWidth = 0
  let listAreaWidth = getInitialWidth() // Default width

  function getInitialWidth () {
    if ($user.listAreaWidthRatio) {
      return ($user.listAreaWidthRatio * 100 * window.innerWidth)
    } else {
      return 360
    }
  }

  function handleMouseDown(e) {
    isResizing = true
    startX = e.clientX
    startWidth = listAreaWidth
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none'
  }

  function handleMouseMove(e) {
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

  function handleMouseUp () {
    isResizing = false
    
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('mouseup', handleMouseUp)
    
    document.body.style.userSelect = ''

    updateFirestoreDoc(`/users/${$user.uid}`, {
      listAreaWidthRatio: (listAreaWidth / window.innerWidth) / 100
    })
  }
</script>

<div class="side-by-side-container">
  <div class="list-area-container" style="width: {listAreaWidth}px;">    
    <ListsArea 
      on:dragstart
      on:dragend
    />
  </div>
  
  <div class="handle-wrapper">
    <GripHandle on:mousedown={handleMouseDown}/>
  </div>

  <div class="calendar-container">
    <Calendar
      on:task-click
      on:dragstart
      on:dragend
      on:dragover
    />
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
  }
</style> 