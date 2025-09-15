<script>
  import RecursiveTask from './RecursiveTask.svelte'
  import Dropzone from './Dropzone.svelte'
  import DateBadge from './DateBadge.svelte'
  import TimelineRendererVisuals from './TimelineRendererVisuals.svelte'
  import { WIDTHS } from '$lib/utils/constants.js'
  import { trackHeight } from '$lib/utils/svelteActions.js'
  import { DateTime } from 'luxon'
  import { getContext } from 'svelte'
  
  let { 
    taskObj,
    children = [], 
    depth, 
    parentID, 
    ancestorRoomIDs = [],
    isLargeFont = false,
    colorForDebugging 
  } = $props()
  
  const { openTaskPopup, willOpenDatePicker } = getContext('app')

  const defaultPxPerDay = 0.4
  const dropzoneHeight = 16
  const squareHeight = 12.5

  let allSorted = $derived(children.sort(chronologically))
  let n = $derived(allSorted.length)
  let contentHeights = $state({})
  let { 
    dayDiffs, 
    margins, 
    pxPerDay, 
    timeMarkerTop 
  } = $derived.by(() => {
    if (allSorted.length > 0 && contentHeights) { // `contentHeights` will fire on mount, and on subsequent child expand/collapse, potentially duplicate calls
      return computeTimelineVars(contentHeights)
    }
    else {
      return { dayDiffs: {}, margins: {}, pxPerDay: defaultPxPerDay, timeMarkerTop: 0 }
    }
  })

  function chronologically (a, b) {
    if (a.startDateISO && b.startDateISO) return a.startDateISO.localeCompare(b.startDateISO)
    else if (a.startDateISO) return -1
    else if (b.startDateISO) return 1
    else return 0
  }

  function computeTimelineVars () {    
    const dayDiffs = {}
    const margins = {}
    let timeMarkerTop = 0
    let pxPerDay = defaultPxPerDay

    for (let i = 0; i <= allSorted.length - 2; i++) {
      dayDiffs[i] = getDayDiff(i, i+1)
    }

    // compute scale factor
    let candidates = []
    for (let i = 0; i <= allSorted.length - 2; i++) {
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

    for (let i = 0; i <= allSorted.length - 2; i++) {
      if (i == allSorted.length - 1) margins[i] = 0
      else {
        const gap = dayDiffs[i] * pxPerDay
        margins[i] = Math.max(0, gap - contentHeights[i] - dropzoneHeight)
      }
    }

    // compute time marker
    const n = allSorted.length
    if (n > 0) {
      const d1 = DateTime.now()
      const d2 = DateTime.fromISO(allSorted[0].startDateISO)
      const diff = d1.diff(d2).as('days')
      
      if (diff < 0) timeMarkerTop = -6 // cap at the top border limit
      
      else if (DateTime.now().toFormat('yyyy-MM-dd') > allSorted[n-1].startDateISO) {
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

    return { dayDiffs, margins, pxPerDay, timeMarkerTop }
  } 
  
  function getDayDiff (i, j) {
    const iso1 = allSorted[i].startDateISO
    const iso2 = allSorted[j].startDateISO

    if (!iso1 || !iso2) return 1 // was null
    else {
      const dt1 = DateTime.fromISO(iso1)
      const dt2 = DateTime.fromISO(iso2)
      return dt2.diff(dt1).as('days')
    }
  }

  function renderDropzone (idx) {
    return {
      idxInThisLevel: idx,
      ancestorRoomIDs: [parentID, ...ancestorRoomIDs],
      roomsInThisLevel: allSorted,
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

<div style="margin-left: {WIDTHS.INDENT_PER_LEVEL}px;">  
  {#if !taskObj.isCollapsed}
    <div class:ghost-negative={n === 0}  
      style="
        left: {WIDTHS.INDENT_PER_LEVEL}px;
        width: {235 - WIDTHS.INDENT_PER_LEVEL * (depth + 1)}px; 
        z-index: {depth};
      "
    >
      <Dropzone {...renderDropzone(0)} />
    </div>

    {#each allSorted as child, i (child.id)}
      <div style="
          margin-bottom: {margins[i]}px;
          position: relative;
          display: flex; align-items: center;
        "
        use:trackHeight={h => { 
          contentHeights[i] = h
          contentHeights = contentHeights
        }}
      >      
        <RecursiveTask {...renderTask(child, depth + 1)}>
          <div slot="info-badge">
            <DateBadge iso={child.startDateISO} onclick={() => {
              willOpenDatePicker.set(true)
              openTaskPopup(child)
            }}/>
          </div>

          <div slot="vertical-timeline">
            <TimelineRendererVisuals {i} sorted={allSorted} {dayDiffs} {pxPerDay} {timeMarkerTop} {squareHeight} />
          </div>
        </RecursiveTask>
      </div>

      <div class:ghost-negative={i === allSorted.length - 1}
        style="
          left: {WIDTHS.INDENT_PER_LEVEL}px;
          width: {235 - WIDTHS.INDENT_PER_LEVEL * (depth + 1)}px;
          z-index: {depth};
        "
      >
        <Dropzone {...renderDropzone(i + 1)} />
      </div>
    {/each}
  {/if}
</div>

<style>
  :root {
    --timeline-left-margin: 8px;
  }
</style>