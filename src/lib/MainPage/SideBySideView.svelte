<script>
  import ListsArea from '$lib/ListsArea/ListsArea.svelte'
  import TodoList from '$lib/ListsArea/TodoList.svelte'
  import Calendar from '$lib/Calendar/Calendar.svelte'
  import { inclusiveWeekTodo } from '/src/store'
  import { onMount, createEventDispatcher } from 'svelte'

  // Props
  export let showLegacyTodo = true; // Default to showing the legacy todo list
  export let listID = null; // Optional specific list ID to display
  export let showToggle = true; // Whether to show the toggle button

  // State
  let isResizing = false;
  let startX = 0;
  let startWidth = 0;
  let listAreaWidth = 360; // Default width
  let minWidth = 250; // Minimum width for list area
  let maxWidth = 800; // Maximum width for list area
  
  const dispatch = createEventDispatcher();

  // Handle mouse down on the resize handle
  function handleMouseDown(e) {
    isResizing = true;
    startX = e.clientX;
    startWidth = listAreaWidth;
    
    // Add event listeners for mouse move and mouse up
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
  }

  // Handle mouse move during resize
  function handleMouseMove(e) {
    if (!isResizing) return;
    
    const deltaX = e.clientX - startX;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX));
    
    listAreaWidth = newWidth;
  }

  // Handle mouse up to stop resizing
  function handleMouseUp() {
    isResizing = false;
    
    // Remove event listeners
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    
    // Restore text selection
    document.body.style.userSelect = '';
    
    // Dispatch event with new width
    dispatch('resize', { width: listAreaWidth });
  }

  // Toggle between legacy todo and multi-list view
  function toggleView() {
    showLegacyTodo = !showLegacyTodo;
    dispatch('viewToggle', { showLegacyTodo });
  }
</script>

<div class="side-by-side-container">
  <!-- List Area Container -->
  <div class="list-area-container" style="width: {listAreaWidth}px;">
    {#if showToggle}
      <button class="toggle-button" on:click={toggleView}>
        {showLegacyTodo ? 'Switch to Multi-List' : 'Switch to Legacy Todo'}
      </button>
    {/if}
    
    {#if showLegacyTodo}
      <!-- Legacy Todo List -->
      <div class="todo-container">
        <TodoList
          listTitle="TO-DO"
          tasksToDisplay={$inclusiveWeekTodo}
          style="padding-top: var(--height-main-content-top-margin); background-color: var(--todo-list-bg-color); border-radius: 16px; height: 100%;"
          willShowCheckbox={false}
          on:task-click
          on:task-create
          on:task-update
          on:dragstart
          on:dragend
          on:dragover
          on:drop
        />
      </div>
    {:else}
      <!-- Multi-list Area -->
      <ListsArea 
        {listID}
        on:task-click
        on:task-create
        on:task-update
        on:dragstart
        on:dragend
        on:dragover
        on:drop
      />
    {/if}
  </div>
  
  <!-- Resize Handle -->
  <div 
    class="resize-handle" 
    on:mousedown={handleMouseDown}
    class:active={isResizing}
  ></div>
  
  <!-- Calendar Container -->
  <div class="calendar-container">
    <Calendar
      on:task-create
      on:task-update
      on:task-click
      on:dragstart
      on:dragend
      on:dragover
      on:drop
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
  
  .list-area-container {
    height: 100%;
    overflow-y: auto;
    background-color: var(--todo-list-bg-color, #f5f5f5);
    position: relative;
    flex-shrink: 0;
  }
  
  .todo-container {
    height: 100%;
    width: 100%;
    overflow-y: auto;
  }
  
  .resize-handle {
    width: 8px;
    height: 100%;
    background-color: transparent;
    cursor: col-resize;
    position: sticky;
    top: 0;
    z-index: 10;
    transition: background-color 0.2s;
  }
  
  .resize-handle:hover,
  .resize-handle.active {
    background-color: rgba(0, 0, 0, 0.1);
  }
  
  .resize-handle::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 50px;
    width: 2px;
    background-color: #ccc;
    border-radius: 1px;
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
</style> 