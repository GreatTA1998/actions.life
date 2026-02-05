<div 
  onclick={() => openTaskPopup(task)}
  ondragstart={e => startTaskDrag({ e, id: task.id, isFromCal: true })} 
  draggable="true" 
  class={isBulletPoint ? '' : calendarBlock}
  style={mergedStyle}
  style:padding-top={isBulletPoint ? '' : 'var(--left-padding)'}
>
  <!-- As long as this parent div is correctly sized, the duration adjusting area 
    will be positioned correctly (it's glued to the bottom of this parent div)

    `min-height` prevents the parent from being super small when it's bullet point mode
  -->
  <div class="flex items-center w-full">
    {#if isBulletPoint}
      <div class="flex items-center" style="
          margin-right: calc(var(--left-padding) - 2px);
          color: {task.isDone ? '#509c13' : 'rgb(20, 20, 20)'};
        "
      >
        <MslCircle style="font-size: 2px;"/>
      </div>
    {/if}
    
    <CalTaskUnit {task} 
      color={(isBulletPoint || task.tagIDs?.length >= 2) ? 'black' : 'white'}
    />
  </div>

  {#if !isBulletPoint && task.tagIDs?.length < 2}
    <div style="flex-grow: 1; overflow: hidden;">
      <div style="font-size: 12px; font-weight: 300; color: {isBulletPoint ? '' : 'white'};">
        {task.notes}
      </div>
    </div>
  {/if}

    <!-- 
      `1vw`: if it's too wide, it overlaps with the task name for short duration tasks 
    -->
    <!-- on:drop preventDefault so that the calendar doesn't think we're scheduling a task -->
    <div draggable="true"
      ondragstart={(e) => startAdjustingDuration(e)}
      ondragend={(e) => adjustDuration(e, task)}
      style="
        cursor: ns-resize;
        position: absolute;
        left: -3px; 
        bottom: {0}px;
        height: {height/12}px; 
        min-height: 3px;
        width: {isBulletPoint ? '20%' : '100%'}; 
      "
    >
  </div>
</div>

<script>
  import CalTaskUnit from '$lib/components/CalTaskUnit.svelte'
  import MslCircle from 'virtual:icons/material-symbols-light/circle'
  import { calendarBlock } from '$lib/styles/reused.module.css'
  import { getTrueY } from '$lib/utils/core.js'
  import { user } from '$lib/store'
  import { pixelsPerHour } from '/src/routes/[user]/components/Calendar/store.js'
  import { getContext } from 'svelte'

  import { getMultiColorBgStyles } from '$lib/utils/multiColorRendering.js'
  
  const { Task, openTaskPopup } = getContext('app')
  const { startTaskDrag } = getContext('drag-drop')

  let { 
    task = null // this component assumes `task` is hydrated
  } = $props()

  const tagColors = $derived(
    (task.tagIDs || [])
      .map(id => $user.tags?.[id]?.color)
      .filter(Boolean)
  )

  let startY = $state(0)
  let height = $derived($pixelsPerHour / 60 * task.duration)
  let isBulletPoint = $derived(height < 24) // 24px is exactly enough to not crop the checkbox and the task name
  let mergedStyle = $derived(getMergedStyle(task))
  
  function getMergedStyle () {
    const styles = []
    
    // TO-FIX: these styles are no longer reactive e.g. opacity change when task is marked as done, or duration changes
    styles.push(`position: relative`)
    styles.push(`height: ${height}px`)
    styles.push(`min-height: 12px`)
    styles.push(`opacity: ${task.isDone ? '0.9' : '0.7'}`)
    styles.push(`padding-left: ${isBulletPoint ? '0px' : 'var(--left-padding)'}`)
    styles.push(`padding-right: var(--left-padding)`)
    styles.push(`display: flex`)
    styles.push(`flex-direction: column`)
    styles.push(`row-gap: 4px`)
    styles.push(`border: ${isBulletPoint ? '' : '1px solid rgba(0,0,0,0.15)'}`)

    if (!isBulletPoint) {
      let bgColor = 'var(--experimental-black)'
      const { tagIDs } = task
      if (tagIDs) {
        if (tagIDs.length === 1) {
          bgColor = $user.tags[tagIDs[0]].color
        } 
        else if (tagIDs.length >= 2) { 
          const multiColorStyles = getMultiColorBgStyles(tagColors, 'dots') // or 'gradient'
          bgColor = multiColorStyles.backgroundColor
          
          // NOTE: these are side-effects, additional CSS property changes
          Object.entries(multiColorStyles).forEach(([k, v]) => {
            if (k !== 'opacity' && v !== undefined && v !== '') {
              const cssKey = k.replace(/([A-Z])/g, '-$1').toLowerCase() // Convert camelCase to kebab-case for CSS
              styles.push(`${cssKey}: ${v}`)
            }
          })
        }
      }

      styles.push(`background-color: ${bgColor}`)
    }
    return styles.join('; ')
  }

  function startAdjustingDuration (e) {
    e.stopPropagation() // DragContext doesn't get involved, duration adjustment is fully handled within this component
    startY = getTrueY(e)
  }
 
  function adjustDuration (e, task) {
    const hoursPerPixel = 1 / $pixelsPerHour
    const minutesPerPixel = 60 * hoursPerPixel

    const newY = getTrueY(e)
    const durationChange = minutesPerPixel * (newY - startY)

    Task.update({
      id: task.id,
      keyValueChanges: {
        duration: Math.max(1, task.duration + durationChange)
      }
    })
  }
</script>