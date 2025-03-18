<script>
  import ListsArea from '$lib/ListsArea/ListsArea.svelte'
  import TodoList from '$lib/ListsArea/TodoList.svelte'
  import Calendar from '$lib/Calendar/Calendar.svelte'
  import GripHandle from './GripHandle.svelte'

  import { inclusiveWeekTodo, user } from '/src/store'
  import { createEventDispatcher } from 'svelte'
  import { updateFirestoreDoc } from '/src/helpers/firebase.js'

  export let showLegacyTodo = true; // Default to showing the legacy todo list
  export let listID = null; // Optional specific list ID to display
  export let showToggle = true; // Whether to show the toggle button

  let isResizing = false;
  let startX = 0;
  let startWidth = 0;
  let listAreaWidth = getInitialWidth() // Default width
  let minWidth = 0; // Minimum width for list area
  let maxWidth = window.innerWidth; // Maximum width for list area
  
  const dispatch = createEventDispatcher()

  function getInitialWidth () {
    if ($user.listAreaWidthRatio) {
      return ($user.listAreaWidthRatio * 100 * window.innerWidth)
    } else {
      return 360
    }
  }

  function handleMouseDown(e) {
    isResizing = true;
    startX = e.clientX;
    startWidth = listAreaWidth;
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
  }

  function handleMouseMove(e) {
    if (!isResizing) return;
    
    const deltaX = e.clientX - startX;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX));
    
    listAreaWidth = newWidth;
  }

  function handleMouseUp () {
    isResizing = false;
    
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    
    document.body.style.userSelect = '';

    updateFirestoreDoc(`/users/${$user.uid}`, {
      listAreaWidthRatio: (listAreaWidth / window.innerWidth) / 100
    })
  }

  function toggleView() {
    showLegacyTodo = !showLegacyTodo;
    dispatch('viewToggle', { showLegacyTodo });
  }
</script>

<div class="side-by-side-container">
  <div class="list-area-container" style="width: {listAreaWidth}px;">
    {#if showToggle}
      <button class="toggle-button" on:click={toggleView}>
        Switch
      </button>
    {/if}
    
    {#if showLegacyTodo}
      <div class="todo-container">
        <TodoList
          listTitle="TO-DO"
          tasksToDisplay={$inclusiveWeekTodo}
          style="padding-top: var(--height-main-content-top-margin); background-color: var(--todo-list-bg-color); border-radius: 16px; height: 100%;"
          willShowCheckbox={false}
          on:dragstart
          on:dragend
          on:dragover
          on:drop
        />
      </div>
    {:else}
      <ListsArea 
        {listID}
        on:dragstart
        on:dragend
      />
    {/if}
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
  
  .todo-container {
    height: 100%;
    width: 100%;
    overflow-y: auto;
    scrollbar-width: none;
  }
  
  .calendar-container {
    flex-grow: 1;
    height: 100%;
    overflow: hidden;
  }
  
  .toggle-button {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 20;
    padding: 5px 10px;
    background-color: var(--primary-color, #4a90e2);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    opacity: 0.7;
    transition: opacity 0.2s;
  }
  
  .toggle-button:hover {
    opacity: 1;
  }
  
  .handle-wrapper {
    position: relative;
    height: 100%;
    z-index: 1;
    display: flex;
    align-items: center;
  }
</style> 