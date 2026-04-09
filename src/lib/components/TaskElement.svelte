<div 
  onclick={() => openTaskPopup(task)}
  ondragstart={e => startTaskDrag({ e, id: task.id, isFromCal: true })} 
  draggable="true" 
  class={isBulletPoint ? '' : calendarBlock}
  style={mergedStyle}
  style:padding-top={isBulletPoint ? '' : 'var(--left-padding)'}
>
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
      color={(isBulletPoint || (task.tagIDs ?? []).length >= 2) ? 'black' : 'white'}
    />
  </div>

  {#if !isBulletPoint && (task.tagIDs ?? []).length < 2}
    <div class="grow-1 overflow-hidden">
      <div style="font-size: {notesFS}; font-weight: 300; color: {isBulletPoint ? '' : 'white'};">
        {task.notes}
      </div>
    </div>
  {/if}
  
  <DurationAdjuster {task} {isBulletPoint} {height} />
</div>

<script>
  import DurationAdjuster from '$lib/components/DurationAdjuster.svelte'
  import CalTaskUnit from '$lib/components/CalTaskUnit.svelte'
  import MslCircle from 'virtual:icons/material-symbols-light/circle'
  import { calendarBlock, notesFS } from '$lib/styles/reused.module.css'
  import { user } from '$lib/store'
  import { pixelsPerHour } from '/src/routes/[user]/components/Calendar/store.js'
  import { getContext } from 'svelte'

  import { getMultiColorBgStyles } from '$lib/utils/multiColorRendering.js'
  
  const { openTaskPopup } = getContext('app')
  const { startTaskDrag } = getContext('drag-drop')

  let { 
    task = null // this component assumes `task` is hydrated
  } = $props()

  const tagColors = $derived(
    (task.tagIDs || [])
      .map(id => $user.tags?.[id]?.color)
      .filter(Boolean)
  )

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
</script>