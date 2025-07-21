<script>
  import RecursiveTask from './RecursiveTask.svelte'
  import Dropzone from './Dropzone.svelte'
  import { WIDTHS } from '/src/lib/utils/constants.js'
  import { DateTime } from 'luxon'
  import { onMount } from 'svelte'
  
  export let children = []
  export let depth
  export let parentID
  export let ancestorRoomIDs = []
  export let isLargeFont = false
  export let colorForDebugging
  
  let currentTimePosition = 24
  let showTimeMarker = false
  let timelineContainerRef
  
  function formatDate(dateStr) {
    if (!dateStr) return 'No date'
    return DateTime.fromISO(dateStr).toFormat("MMM d, yyyy")
  }

  function calculateTimePositions(tasks) {
    // Sort tasks by date
    const sortedTasks = [...tasks].sort((a, b) => {
      if (!a.startDateISO) return 1
      if (!b.startDateISO) return -1
      return new Date(a.startDateISO) - new Date(b.startDateISO)
    })
    
    // Calculate spacings between dated tasks
    const spacings = Array(sortedTasks.length).fill(0)
    const pxPerDay = 0.4
    
    for (let i = 0; i < sortedTasks.length - 1; i++) {
      if (sortedTasks[i].startDateISO && sortedTasks[i+1].startDateISO) {
        const current = new Date(sortedTasks[i].startDateISO)
        const next = new Date(sortedTasks[i+1].startDateISO)
        const daysDiff = Math.max(1, (next - current) / (24 * 60 * 60 * 1000))
        spacings[i] = pxPerDay * daysDiff
      }
    }
    
    return { sortedTasks, spacings }
  }
  
  function updateTimeMarker() {
    if (!timelineContainerRef || !sortedTasks.length) {
      showTimeMarker = false
      return
    }
    
    const today = DateTime.now().startOf('day')
    const items = timelineContainerRef.querySelectorAll('.timeline-item')
    
    // Extract dates from tasks
    const datedItems = sortedTasks
      .map((task, index) => {
        if (!task.startDateISO) return null
        try {
          return { 
            index, 
            date: DateTime.fromISO(task.startDateISO).startOf('day') 
          }
        } catch (e) {
          return null
        }
      })
      .filter(item => item !== null)
    
    if (!datedItems.length) {
      showTimeMarker = false
      return
    }
    
    // Find closest dates before and after today
    const before = datedItems
      .filter(item => item.date < today)
      .sort((a, b) => b.date.toMillis() - a.date.toMillis())[0]
      
    const after = datedItems
      .filter(item => item.date > today)
      .sort((a, b) => a.date.toMillis() - b.date.toMillis())[0]
    
    // Function to get vertical position at index
    function getPosition(index) {
      let pos = 24
      for (let i = 0; i < index; i++) {
        if (items[i]) {
          pos += items[i].offsetHeight + (spacings[i] || 5)
        }
      }
      return pos
    }
    
    // Handle different position cases
    if (!before && after) {
      // Today is before all dates
      currentTimePosition = 24
    } else if (before && !after) {
      // Today is after all dates
      const beforeItem = items[before.index]
      currentTimePosition = getPosition(before.index) + (beforeItem?.offsetHeight || 0)
    } else if (before && after) {
      // Today is between two dates - interpolate position
      const beforePos = getPosition(before.index) + (items[before.index]?.offsetHeight || 0)
      const afterPos = getPosition(after.index)
      
      // Calculate day ratio
      const totalDays = after.date.diff(before.date).as('days')
      const elapsed = today.diff(before.date).as('days')
      const ratio = Math.max(0, Math.min(1, totalDays > 0 ? elapsed / totalDays : 0))
      
      currentTimePosition = beforePos + (ratio * (afterPos - beforePos))
    }
    
    showTimeMarker = true
  }
  
  // Calculate marker position once when mounted and when data changes
  onMount(() => setTimeout(updateTimeMarker, 100))
  
  $: timelineData = calculateTimePositions(children)
  $: sortedTasks = timelineData.sortedTasks
  $: spacings = timelineData.spacings
  $: if (sortedTasks && timelineContainerRef) setTimeout(updateTimeMarker, 100)
</script>

<div class="timeline-container" bind:this={timelineContainerRef}>
  {#if sortedTasks.length > 0}
    <div class="timeline-line"></div>
    
    {#if showTimeMarker}
      <div class="time-marker" style="top: {currentTimePosition}px;">
        <div class="marker-dot"></div>
      </div>
    {/if}
  {/if}
  
  <Dropzone
    ancestorRoomIDs={[parentID, ...ancestorRoomIDs]}
    roomsInThisLevel={children}
    idxInThisLevel={0}
    parentID={parentID}
    {colorForDebugging}
  />

  {#each sortedTasks as child, i (child.id)}
    <!-- note the padding-left here -->
    <div class="timeline-item" style="margin-bottom: {spacings[i]}px; padding-left: 0px;">      
      <RecursiveTask
        taskObj={child}
        depth={depth+1}
        willShowCheckbox={false}
        {isLargeFont}
        ancestorRoomIDs={[parentID, ...ancestorRoomIDs]}
      >
        <div class="date-badge">
          <div>{formatDate(child.startDateISO)}</div>
          <!-- <div>{child.startDateISO}</div> -->
        </div>
      </RecursiveTask>
    </div>

    <div 
      class:ghost-negative={i === sortedTasks.length - 1}
      style="
        width: 235px;
        left: {WIDTHS.INDENT_PER_LEVEL * (depth + 1)}px;
        z-index: {depth};
      "
    >
      <Dropzone
        ancestorRoomIDs={[parentID, ...ancestorRoomIDs]}
        roomsInThisLevel={children}
        idxInThisLevel={i + 1}
        parentID={parentID}
        {colorForDebugging}
      />
    </div>
  {/each}
</div>

<style>
  :root {
    --timeline-left-margin: 8px;
  }

  .timeline-container {
    position: relative;
    padding-left: var(--timeline-left-margin);
  }
  
  .timeline-line {
    position: absolute;
    top: 24px;
    left: var(--timeline-left-margin);
    width: 2px;
    height: calc(100% - 48px);
    background-color: #ddd;
    z-index: 0;
  }
  
  .timeline-item {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 30px;
  }
  
  .ghost-negative {
    position: absolute;
    bottom: -18px;
  }

  .date-badge {
    white-space: nowrap;
    flex-shrink: 0;
    font-size: 12px;
    color: #666;
    padding: 2px 4px;
    border-radius: 3px;
    border: 1px solid #ddd;
    background-color: white;
    text-align: center;
  }
  
  .time-marker {
    position: absolute;
    left: calc(var(--timeline-left-margin) - 3px);
    z-index: 1;
    pointer-events: none;
  }
  
  .marker-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--location-indicator-color, #ff5722);
  }
</style> 