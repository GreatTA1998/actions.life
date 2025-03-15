<script>
  import RecursiveTask from './RecursiveTask.svelte';
  import Dropzone from './Dropzone.svelte';
  import { createEventDispatcher } from 'svelte';
  
  export let children = [];
  export let depth;
  export let parentID;
  export let ancestorRoomIDs = []
  export let isLargeFont = false;
  export let colorForDebugging;
  
  function formatDate (dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }) // e.g. "Jun 15"
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
</script>

<div class="timeline-container">
  <!-- {#if sortedTasks.length > 0}
    <div class="timeline-line"></div>
  {/if} -->
  
  {#each sortedTasks as child, i (child.id)}
    <!-- style="padding-bottom: {spacings[child.id]}px" -->
    <div class="timeline-item">      
      <div class="task-wrapper">
        <RecursiveTask
          taskObj={child}
          depth={depth+1}
          willShowCheckbox={false}
          {isLargeFont}
          ancestorRoomIDs={[parentID, ...ancestorRoomIDs]}
          {colorForDebugging}
        >
          {#if child.startDateISO}
            <div class="date-badge">
              {formatDate(child.startDateISO)}
            </div>
          {/if}
        </RecursiveTask>
      </div>
      
      <div class:absolute-bottom={i === sortedTasks.length - 1}>
        <Dropzone
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
    padding-left: 40px; /* Reduced padding */
    margin-left: 0; /* Removed extra margin */
    border-left: 2px solid #ddd;
    padding-top: 12px;
  }
  
  .timeline-line {
    position: absolute;
    top: 0;
    left: 8px; /* align with center of checkbox */
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

  .date-badge {
    min-width: 52px;
    font-size: 12px;
    color: #666;
    padding: 2px 4px;
    border-radius: 3px;
    border: 1px solid #ddd;
    background-color: white;
    text-align: center;
  }
  
  .date-indicator {
    position: absolute;
    left: -50px;
    top: 0;
    bottom: 0;
    width: 40px; /* Reduced width */
    display: flex;
    align-items: center;
  }
  
  .date-marker {
    position: absolute;
    left: 0; /* Align with timeline */
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #4CAF50;
    transform: translateX(-5px); /* Center on timeline */
    z-index: 1;
  }
  
  .date-label {
    position: absolute;
    left: 10px; /* Position to the right of the timeline */
    font-size: 12px;
    color: #666;
    white-space: nowrap;
  }
</style> 