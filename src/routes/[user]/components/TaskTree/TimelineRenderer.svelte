<script>
  import RecursiveTask from './RecursiveTask.svelte'
  import Dropzone from './Dropzone.svelte'
  import DateBadge from './DateBadge.svelte'
  import TimelineRendererVisuals from './TimelineRendererVisuals.svelte'
  import { trackHeight } from '$lib/utils/svelteActions.js'
  import { DateTime } from 'luxon'
  import { getContext } from 'svelte'
  
  let { 
    task,
    children = [], 
    depth, 
    parentID, 
    ancestorIDs = [],
    debugColor 
  } = $props()
  
  const { openTaskPopup } = getContext('app')
  const { indent } = getContext('list-config')

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
    if (allSorted.length > 0 && Object.keys(contentHeights).length === allSorted.length) { // Ensure all children have reported heights before calculating spacing
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

    for (let i = 0; i <= allSorted.length - 2; i++) {
      if (i == allSorted.length - 1) margins[i] = 0
      else {
        margins[i] = dayDiffs[i] * pxPerDay
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

  function dzProps (i) {
    return {
      idxInThisLevel: i,
      ancestorIDs: [parentID, ...ancestorIDs],
      roomsInThisLevel: allSorted,
      parentID: parentID,
      debugColor,
    }
  }

  function renderTask (node, depth) {
    return {
      task: node,
      depth,
      ancestorIDs: [parentID, ...ancestorIDs],
    }
  }
</script>

<div style="margin-left: {indent()}">  
  {#if !task.isCollapsed}
    {#each allSorted as child, i (child.id)}
      <Dropzone {...dzProps(i+1)} />

      <div 
        style:margin-bottom="{margins[i]}px"
        class="relative flexbox items-center" 
        use:trackHeight={h => { 
          contentHeights[i] = h
          contentHeights = contentHeights
        }}
      >
        <RecursiveTask {...renderTask(child, depth + 1) }>
          {#snippet infoBadge ()}
            <DateBadge iso={child.startDateISO} onclick={() => {
              openTaskPopup(child)
            }}/>
          {/snippet}

          {#snippet verticalTimeline ()}
            <TimelineRendererVisuals {i} sorted={allSorted} {dayDiffs} {pxPerDay} {timeMarkerTop} {squareHeight} />
          {/snippet}
        </RecursiveTask>
      </div>
    {/each}

    <Dropzone {...dzProps(n)} 
      extraClass="ghost-negative"
      extraStyle="left: {indent()}; right: 0; z-index: {depth}"
    />
  {/if}
</div>