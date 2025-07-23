<script>
  import RecursiveTask from './RecursiveTask.svelte'
  import Dropzone from './Dropzone.svelte'
  import DateBadge from './DateBadge.svelte'
  import TimelineRendererVisuals from './TimelineRendererVisuals.svelte'
  import { WIDTHS } from '$lib/utils/constants.js'
  import { trackHeight } from '$lib/utils/svelteActions.js'
  import { DateTime } from 'luxon'
  import { getContext } from 'svelte'
  
  export let children = []
  export let depth
  export let parentID
  export let ancestorRoomIDs = []
  export let isLargeFont = false
  export let colorForDebugging
  
  const { openTaskPopup } = getContext('app')

  const defaultPxPerDay = 0.4
  const taskNameHeight = 30
  const dropzoneHeight = 16
  const squareHeight = 12.5

  let dayDiffs = {}
  let margins = {}
  let contentHeights = {}
  let pxPerDay = defaultPxPerDay
  let timeMarkerTop = 0
  let sorted = []
  let scheduled = []
  let unscheduled = []

  $: computeStateArrays(children)

  // `contentHeights` will fire on mount, and on subsequent child expand/collapse
  // TO-DO: reduce the number of duplicate calls
  $: if (sorted.length > 0) updateScaleFactor(contentHeights)

  function computeStateArrays () {
    scheduled = children.filter(c => c.startDateISO)
    sorted = [...scheduled].sort((a, b) => a.startDateISO.localeCompare(b.startDateISO))

    unscheduled = children.filter(c => !c.startDateISO)
  }

  function computeMarginBottom (i) {
    if (i == sorted.length - 1) return 0
    else {
      const gap = dayDiffs[i] * pxPerDay
      return Math.max(0, gap - contentHeights[i] - dropzoneHeight)
    }
  }

  function updateScaleFactor () {    
    for (let i = 0; i <= sorted.length - 2; i++) {
      dayDiffs[i] = getDayDiff(i, i+1)
    }

    let candidates = []
    for (let i = 0; i <= sorted.length - 2; i++) {
      if (dayDiffs[i] === null) continue
      else {
        const minVisualGap = contentHeights[i] + dropzoneHeight
        if (defaultPxPerDay * dayDiffs[i] < minVisualGap) {
          // note: dayDiffs of 0, 1 are treated as 2
          const nonZeroDayDiff = Math.max(dayDiffs[i], 2) // note: 2 nodes with the same start date will have infinity scale factor, so it'll be handled as 1
          candidates = [...candidates, (minVisualGap / nonZeroDayDiff)]
        }
      }
    }
    pxPerDay = Math.max(...candidates, defaultPxPerDay)

    for (let i = 0; i < sorted.length - 1; i++) {
      margins[i] = computeMarginBottom(i)
    }
    margins = margins

    // TO-DO: make this an explicit effect
    // compute the positioning of the time marker
    const n = sorted.length
    if (n > 0) {
      const d1 = DateTime.now()
      const d2 = DateTime.fromISO(sorted[0].startDateISO)
      const diff = d1.diff(d2).as('days')
      
      if (diff < 0) timeMarkerTop = -6 // cap at the top border limit
      
      else if (DateTime.now().toFormat('yyyy-MM-dd') > sorted[n-1].startDateISO) {
        let totalHeight = 0
        for (let i = 0; i <= n - 2; i++) {
          totalHeight += contentHeights[i] + dropzoneHeight + margins[i]
        }
        timeMarkerTop = totalHeight + squareHeight + 6 // 6 is the height of each stem
      } 
      else {
        timeMarkerTop = diff * pxPerDay  + squareHeight/2
      }
    }
  } 
  
  function getDayDiff (i, j) {
    const iso1 = sorted[i].startDateISO
    const iso2 = sorted[j].startDateISO

    if (!iso1 || !iso2) return null 
    else {
      const dt1 = DateTime.fromISO(iso1)
      const dt2 = DateTime.fromISO(iso2)
      return dt2.diff(dt1).as('days')
    }
  }

  function renderDropzone (idx, nodesThisLevel) {
    return {
      idxInThisLevel: idx,
      ancestorRoomIDs: [parentID, ...ancestorRoomIDs],
      roomsInThisLevel: nodesThisLevel,
      parentID: parentID,
      colorForDebugging,
    }
  }

  function renderTask (node, depth) {
    return {
      taskObj: node,
      depth,
      willShowCheckbox: true,
      isLargeFont,
      ancestorRoomIDs: [parentID, ...ancestorRoomIDs],
    }
  }
</script>

<div style="position: relative; margin-left: {WIDTHS.INDENT_PER_LEVEL}px;">  
  {#if sorted.length > 0}
    <Dropzone {...renderDropzone(0, sorted)} />
  {/if}

  <div style="position: relative;">
    {#each sorted as child, i (child.id)}
      <div style="
        position: relative; display: flex; align-items: center;
        margin-bottom: {margins[i]}px;"
        use:trackHeight={h => { 
          contentHeights[i] = h
          contentHeights = contentHeights
        }}
      >      
        <RecursiveTask {...renderTask(child, depth + 1)}>
          <div slot="info-badge">
            <DateBadge iso={child.startDateISO} on:click={() => openTaskPopup(child)}/>
          </div>

          <div slot="vertical-timeline">
            <TimelineRendererVisuals {i} {sorted} {dayDiffs} {pxPerDay} {timeMarkerTop} {squareHeight} />
          </div>
        </RecursiveTask>
      </div>

      <div class:ghost-negative={i === sorted.length - 1}
        style="
          width: 235px;
          left: {WIDTHS.INDENT_PER_LEVEL * (depth + 1)}px;
          z-index: {depth};"
      >
        <Dropzone {...renderDropzone(i + 1, sorted)} />
      </div>
    {/each}
  </div>

  {#if unscheduled.length > 0}
    <Dropzone {...renderDropzone(sorted.length, unscheduled)} />
  {/if}

  {#each unscheduled as child, i (child.id)}
    <div style="position: relative; display: flex; align-items: center;">      
      <RecursiveTask {...renderTask(child, depth + 1)}>
        <div slot="info-badge">
          <DateBadge iso={child.startDateISO} on:click={() => openTaskPopup(child)}/>
        </div>
      </RecursiveTask>
    </div>

    <div class:ghost-negative={i === unscheduled.length - 1}
      style="
        width: 235px;
        left: {WIDTHS.INDENT_PER_LEVEL * (depth + 1)}px;
        z-index: {depth};"
    >
      <Dropzone {...renderDropzone(i + 1, unscheduled)} />
    </div>
  {/each}
</div>

<style>
  :root {
    --timeline-left-margin: 8px;
  }
  
  .ghost-negative {
    position: absolute;
    bottom: -18px;
  }
</style>