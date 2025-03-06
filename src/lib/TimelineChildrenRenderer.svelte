<script>
  import RecursiveTaskElement from '$lib/RecursiveTaskElement.svelte';
  import ReusableHelperDropzone from '$lib/ReusableHelperDropzone.svelte';
  import { createEventDispatcher } from 'svelte';
  
  export let children = [];
  export let depth;
  export let parentID;
  export let ancestorRoomIDs = [];
  export let willShowCheckbox = true;
  export let isLargeFont = false;
  export let colorForDebugging;
  
  const dispatch = createEventDispatcher();
  
  // Format date for display (e.g., "Jul 15")
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
  
  // Timeline-specific calculations
  function calculateTimePositions(tasks) {
    // Sort tasks chronologically if they have startDateISO
    const sortedTasks = [...tasks].sort((a, b) => {
      if (!a.startDateISO) return 1;
      if (!b.startDateISO) return -1;
      return new Date(a.startDateISO) - new Date(b.startDateISO);
    });
    
    // Calculate vertical spacing
    let spacings = {};
    const baseSpacing = 10; // Base spacing between tasks (minimal spacing)
    const maxSpacing = 100; // Maximum spacing to prevent too much empty space
    const dayInMs = 24 * 60 * 60 * 1000; // Milliseconds in a day
    
    // Find min and max dates to calculate scale
    let minDate = null;
    let maxDate = null;
    
    sortedTasks.forEach(task => {
      if (task.startDateISO) {
        const date = new Date(task.startDateISO);
        if (!minDate || date < minDate) minDate = date;
        if (!maxDate || date > maxDate) maxDate = date;
      }
    });
    
    // Calculate scale factor if we have date range
    const scaleFactor = (minDate && maxDate && maxDate > minDate) 
      ? Math.min(maxSpacing / baseSpacing, (maxDate - minDate) / dayInMs)
      : 1;
    
    let prevDate = null;
    
    sortedTasks.forEach(task => {
      // Default minimal spacing
      spacings[task.id] = baseSpacing;
      
      // If tasks have dates, space them proportionally
      if (task.startDateISO && prevDate) {
        const currentDate = new Date(task.startDateISO);
        const daysDiff = Math.max(1, (currentDate - prevDate) / dayInMs);
        
        // Scale the spacing based on days difference, but cap it
        spacings[task.id] = Math.min(baseSpacing * daysDiff * scaleFactor, maxSpacing);
        prevDate = currentDate;
      } else if (task.startDateISO) {
        // First task with a date
        prevDate = new Date(task.startDateISO);
      }
    });
    
    return { sortedTasks, spacings };
  }
  
  $: timelineData = calculateTimePositions(children);
  $: sortedTasks = timelineData.sortedTasks;
  $: spacings = timelineData.spacings;
  
  // Forward the task-create event from child components
  function handleTaskCreate(event) {
    dispatch('task-create', event.detail);
  }
</script>

<div class="timeline-container">
  <!-- Timeline visualization (vertical line) -->
  {#if sortedTasks.length > 0}
    <div class="timeline-line"></div>
  {/if}
  
  <!-- Render children in timeline order with calculated vertical spacing -->
  {#each sortedTasks as child, i (child.id)}
    <div class="timeline-item" style="margin-bottom: {spacings[child.id]}px">
      <!-- Date indicator with marker on timeline -->
      {#if child.startDateISO}
        <div class="date-indicator">
          <div class="date-marker"></div>
          <div class="date-label">{formatDate(child.startDateISO)}</div>
        </div>
      {/if}
      
      <div class="task-wrapper">
        <RecursiveTaskElement
          taskObj={child}
          depth={depth+1}
          {willShowCheckbox}
          {isLargeFont}
          ancestorRoomIDs={[parentID, ...ancestorRoomIDs]}
          {colorForDebugging}
          on:task-click
          on:task-create={handleTaskCreate}
          on:task-update
        />
      </div>
      
      <!-- Dropzone logic -->
      <div class:absolute-bottom={i === sortedTasks.length - 1}>
        <ReusableHelperDropzone
          ancestorRoomIDs={[parentID, ...ancestorRoomIDs]}
          roomsInThisLevel={children}
          idxInThisLevel={i + 1}
          parentID={parentID}
          {colorForDebugging}
          listID={child.listID}
        />
      </div>
    </div>
  {/each}
</div>

<style>
  .timeline-container {
    position: relative;
    padding-left: 60px; /* Reduced padding */
    margin-left: 0; /* Removed extra margin */
  }
  
  .timeline-line {
    position: absolute;
    top: 0;
    left: 20px; /* Moved timeline closer to the left */
    width: 2px;
    height: 100%;
    background-color: #ddd;
    z-index: 0;
  }
  
  .timeline-item {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 30px;
  }
  
  .task-wrapper {
    flex: 1;
    margin-left: 10px; /* Add a small margin to separate from timeline */
  }
  
  .absolute-bottom {
    position: absolute;
    bottom: -18px;
  }
  
  .date-indicator {
    position: absolute;
    left: -60px;
    top: 0;
    bottom: 0;
    width: 60px; /* Reduced width */
    display: flex;
    align-items: center;
  }
  
  .date-marker {
    position: absolute;
    left: 20px; /* Align with timeline */
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #4CAF50;
    transform: translateX(-5px); /* Center on timeline */
    z-index: 1;
  }
  
  .date-label {
    position: absolute;
    left: 30px; /* Position to the right of the timeline */
    font-size: 12px;
    color: #666;
    white-space: nowrap;
  }
</style> 