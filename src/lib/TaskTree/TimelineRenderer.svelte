<script>
  import RecursiveTask from './RecursiveTask.svelte'
  import Dropzone from './Dropzone.svelte'
  import { DateTime } from 'luxon'
  
  export let children = []
  export let depth;
  export let parentID;
  export let ancestorRoomIDs = []
  export let isLargeFont = false
  export let colorForDebugging

  const indentationAmount = 32
  
  function formatDate (dateStr) {
    if (!dateStr) return '';

    const dt = DateTime.fromISO(dateStr)
    return `${dt.toFormat("MMM")} ${dt.toFormat("d")}, ${dt.toFormat("yyyy")}`;
  }

  function calculateTimePositions (tasks) {
    const sortedTasks = [...tasks].sort((a, b) => {
      if (!a.startDateISO) return 1
      if (!b.startDateISO) return -1
      return new Date(a.startDateISO) - new Date(b.startDateISO)
    })
    
    const n = sortedTasks.length
    let spacings = new Array(n).fill(0)

    const dayInMs = 24 * 60 * 60 * 1000; // Milliseconds in a day
    const pxPerDay = 0.4
    
    for (let i = 0; i < n - 1; i++) {
      const current = new Date(sortedTasks[i].startDateISO)
      const next = new Date(sortedTasks[i + 1].startDateISO)

      if (current && next) {
        const daysDiff = Math.max(1, (next - current) / dayInMs)
        spacings[i] = pxPerDay * daysDiff
      }
    }
    return { sortedTasks, spacings }
  }
  
  $: timelineData = calculateTimePositions(children)
  $: sortedTasks = timelineData.sortedTasks
  $: spacings = timelineData.spacings
</script>

<div class="timeline-container">
  {#if sortedTasks.length > 0}
    <div class="timeline-line"></div>
  {/if}
  
  <Dropzone
    ancestorRoomIDs={[parentID, ...ancestorRoomIDs]}
    roomsInThisLevel={children}
    idxInThisLevel={0}
    parentID={parentID}
    {colorForDebugging}
    listID={children[0].listID}
  />

  {#each sortedTasks as child, i (child.id)}
    <div class="timeline-item" style="margin-bottom: {spacings[i]}px">      
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
          {:else}
            <div class="date-badge">
              N/A
            </div>
          {/if}
        </RecursiveTask>
      </div>
    </div>

    <div 
      class:ghost-negative={i === sortedTasks.length - 1}
      style="
        width: calc(235px - {indentationAmount * depth}px); 
        z-index: {depth};
      "
    >
      <Dropzone
        ancestorRoomIDs={[parentID, ...ancestorRoomIDs]}
        roomsInThisLevel={children}
        idxInThisLevel={i + 1}
        parentID={parentID}
        {colorForDebugging}
        listID={child.listID}
      />
    </div>
  {/each}
</div>

<style>
  .timeline-container {
    position: relative;
    padding-left: 40px;
  }
  
  .timeline-line {
    position: absolute;
    top: 24px;
    left: 40px; /* modify this value to center the timeline */
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
  
  .task-wrapper {
    flex: 1;
    margin-left: 10px; /* Add a small margin to separate from timeline */
  }
  
  .ghost-negative {
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
</style> 