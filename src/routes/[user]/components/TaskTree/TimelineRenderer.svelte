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
  let timelineLeftOffset = 15 // Default fallback, will be measured dynamically
  
  function measureCheckboxCenterPosition() {
    if (!timelineContainerRef) return 15
    
    // Find the first checkbox or caret in the timeline
    const firstTaskRow = timelineContainerRef.querySelector('.timeline-item .task-row-container')
    if (!firstTaskRow) return 15
    
    // Look for checkbox or caret (both are in the first child div)
    const checkboxOrCaretContainer = firstTaskRow.querySelector('div:first-child')
    if (!checkboxOrCaretContainer) return 15
    
    // Get the center position of the checkbox/caret container
    const containerRect = timelineContainerRef.getBoundingClientRect()
    const checkboxRect = checkboxOrCaretContainer.getBoundingClientRect()
    
    // Calculate center point relative to timeline container
    const checkboxCenter = (checkboxRect.left + checkboxRect.right) / 2
    const containerLeft = containerRect.left
    const relativeCenter = checkboxCenter - containerLeft
    
    return Math.max(8, relativeCenter) // Ensure minimum offset
  }
  
  function formatRelativeTime(dateStr) {
    if (!dateStr) return 'No date'
    
    const taskDate = DateTime.fromISO(dateStr)
    const now = DateTime.now()
    const diff = taskDate.diff(now)
    const isPast = diff.as('milliseconds') < 0
    
    const absDays = Math.abs(diff.as('days'))
    const absMonths = Math.abs(diff.as('months'))
    const absYears = Math.abs(diff.as('years'))
    
    const prefix = isPast ? '' : 'in '
    const suffix = isPast ? ' ago' : ''
    
    // Use days for anything under 45 days (more precise than "1-1.5 months")
    if (absDays < 45) {
      if (absDays < 1) return 'today'
      if (absDays < 2) return `${prefix}1d${suffix}`
      return `${prefix}${Math.floor(absDays)}d${suffix}`
    }
    
    // Use months for most cases, but switch to years when it makes sense
    if (absMonths < 11.5) {
      if (absMonths < 2) return `${prefix}1mo${suffix}`
      return `${prefix}${Math.floor(absMonths)}mo${suffix}`
    }
    
    // Around 12 months, use "1 year" 
    if (absMonths >= 11.5 && absMonths < 13) {
      return `${prefix}1y${suffix}`
    }
    
    // 13-17 months, use months for precision
    if (absMonths < 18) {
      return `${prefix}${Math.floor(absMonths)}mo${suffix}`
    }
    
    // 18+ months, use years
    if (absYears < 2) {
      // More precise for 1-2 year range
      if (absYears >= 1.5) return `${prefix}1.5y${suffix}`
      return `${prefix}1y${suffix}`
    }
    
    return `${prefix}${Math.floor(absYears)}y${suffix}`
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
  
  function calculateTaskPositions() {
    if (!timelineContainerRef) return []
    
    // Get only direct child timeline items, not nested ones
    const items = Array.from(timelineContainerRef.children).filter(child => 
      child.classList.contains('timeline-item')
    )
    const positions = []
    const containerRect = timelineContainerRef.getBoundingClientRect()
    
    items.forEach((item) => {
      // Allow items with minimal height (like collapsed items) to contribute
      if (item.offsetHeight === 0 && item.offsetWidth === 0) return
      
      const rect = item.getBoundingClientRect()
      const relativeTop = rect.top - containerRect.top
      const relativeBottom = relativeTop + rect.height
      
      // Aggressive vertical proximity - allow timeline to "kebab" through task rows
      // Only exclude items that are completely outside reasonable bounds
      const tolerance = 50
      if (relativeBottom > -tolerance && relativeTop < containerRect.height + tolerance) {
        // Compress the task position to create spacing around the task center, avoiding symbols
        const taskCenter = relativeTop + (rect.height / 2)
        const tightSpacing = 8 // Enough space to avoid interfering with expand/collapse symbols
        positions.push({
          start: taskCenter - tightSpacing,
          end: taskCenter + tightSpacing
        })
      }
    })
    
    // Sort by position to ensure proper clipping
    return positions.sort((a, b) => a.start - b.start)
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
      // Show marker in middle of timeline even without dated items
      if (taskPositions.length > 0) {
        const midpoint = (taskPositions[0].start + taskPositions[taskPositions.length - 1].end) / 2
        currentTimePosition = midpoint
        showTimeMarker = true
      } else {
        showTimeMarker = false
      }
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
      // Today is before all dates - position in pre-timeline segment
      const firstTaskStart = taskPositions.length > 0 ? taskPositions[0].start : 24
      const preTimelineStart = -4
      const preTimelineEnd = firstTaskStart
      const totalDays = after.date.diff(DateTime.now()).as('days')
      const ratio = Math.min(0.8, Math.max(0.2, 1 / (totalDays + 1)))
      currentTimePosition = preTimelineStart + (ratio * (preTimelineEnd - preTimelineStart))
    } else if (before && !after) {
      // Today is after all dates - position in post-timeline segment
      const beforeItem = items[before.index]
      const basePosition = getPosition(before.index) + (beforeItem?.offsetHeight || 0)
      const daysSince = DateTime.now().diff(before.date).as('days')
      const extensionRatio = Math.min(0.8, Math.max(0.2, daysSince / (daysSince + 7)))
      currentTimePosition = basePosition + (extensionRatio * 12)
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
  onMount(() => {
    setTimeout(() => {
      timelineLeftOffset = measureCheckboxCenterPosition()
      updateTimeMarker()
    }, 100)
    
    // Set up mutation observer to detect DOM changes (expand/collapse)
    if (timelineContainerRef) {
      const observer = new MutationObserver(() => {
        timelineLeftOffset = measureCheckboxCenterPosition()
        updateTaskPositions()
      })
      
      observer.observe(timelineContainerRef, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      })
      
      return () => observer.disconnect()
    }
  })
  
  $: timelineData = calculateTimePositions(children)
  $: sortedTasks = timelineData.sortedTasks
  $: spacings = timelineData.spacings
  $: if (sortedTasks && timelineContainerRef) setTimeout(() => {
    timelineLeftOffset = measureCheckboxCenterPosition()
    updateTimeMarker()
  }, 100)
  
  // Timeline segment calculations
  let taskPositions = []
  let updateTimeout
  
  function updateTaskPositions() {
    if (!timelineContainerRef) return
    
    // Debounce rapid updates
    clearTimeout(updateTimeout)
    updateTimeout = setTimeout(() => {
      taskPositions = calculateTaskPositions()
    }, 100)
  }
  
  // Update on data changes
  $: if (sortedTasks && timelineContainerRef) {
    updateTaskPositions()
  }
  
  // Update on mount and when container changes
  $: if (timelineContainerRef) {
    updateTaskPositions()
  }
</script>

  <div class="timeline-container" bind:this={timelineContainerRef}>
  {#if sortedTasks.length > 0}
    <!-- Pre-timeline segment - extends from parent level to first task -->
    {#if taskPositions.length > 0}
      {@const firstTaskStart = taskPositions[0].start}
      {@const preTimelineHeight = Math.max(0, firstTaskStart + 4)}
      {#if preTimelineHeight > 3}
        <div 
          class="timeline-segment" 
          style="
            top: 8px;
            left: {timelineLeftOffset}px;
            height: {preTimelineHeight - 14}px;
          "
        ></div>
      {/if}
    {/if}
    
    <!-- Create individual line segments between tasks -->
    {#each taskPositions as position, i}
      {#if i < taskPositions.length - 1}
        {@const nextStart = taskPositions[i + 1].start}
        {@const segmentStart = position.end}
        {@const segmentHeight = Math.max(0, nextStart - segmentStart)}
        {#if segmentHeight > 1}
          <div 
            class="timeline-segment" 
            style="
              top: {segmentStart}px;
              left: {timelineLeftOffset}px;
              height: {segmentHeight}px;
            "
          ></div>
        {/if}
      {/if}
    {/each}
    
    <!-- Post-timeline segment - extends beyond last task -->
    {#if taskPositions.length > 0}
      {@const lastTaskEnd = taskPositions[taskPositions.length - 1].end}
      {@const postTimelineHeight = 12}
      <div 
        class="timeline-segment" 
        style="
          top: {lastTaskEnd}px;
          left: {timelineLeftOffset}px;
          height: {postTimelineHeight - 6}px;
        "
      ></div>
    {/if}
    
    {#if showTimeMarker}
      <div class="time-marker" style="top: {currentTimePosition}px; left: {timelineLeftOffset}px;">
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
    <div class="timeline-item" style="margin-bottom: {spacings[i]}px; padding-left: {WIDTHS.INDENT_PER_LEVEL}px;">      
      <RecursiveTask
        taskObj={child}
        depth={depth+1}
        willShowCheckbox
        {isLargeFont}
        ancestorRoomIDs={[parentID, ...ancestorRoomIDs]}
      >
        <div class="date-badge">
          <div>{formatRelativeTime(child.startDateISO)}</div>
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
  }
  
  .timeline-segment {
    position: absolute;
    width: 1px;
    background-color: #ddd;
    z-index: 1;
    pointer-events: none;
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
    border: 1px solid black;
    color: black;
    padding: 2px 4px;
    border-radius: 6px;
    text-align: center;
    display: flex;
    align-items: center;
  }
  
  .time-marker {
    position: absolute;
    z-index: 2;
    pointer-events: none;
  }
  
  .marker-dot {
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background-color: var(--location-indicator-color, #ff5722);
    transform: translateX(-50%);
  }
</style> 