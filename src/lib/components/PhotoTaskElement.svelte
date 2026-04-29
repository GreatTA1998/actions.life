<div onclick={() => openTaskPopup(task)}
  draggable="true" 
  ondragstart={e => startTaskDrag({ e, id: task.id, isFromCal: true })}
  use:lazyCallable={() => hasIntersected = true}
  class={calendarBlock}
  style="
    position: relative;
    display: flex; 
    flex-direction: column;
    min-height: 24px;
    height: {height}px; 
    opacity: {task.isDone ? '0.9' : '0.7'};
    background-color: {isBulletPoint ? '' : 'var(--experimental-black)'};
    background-image: url({hasIntersected ? task.imageDownloadURL : ''});
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  "
>
  <div 
    style:background="linear-gradient(rgba(0,0,0,0.7), transparent)"
    style:padding="var(--left-padding)" 
    style:border-radius="var(--left-padding)"
  >
    <CalTaskUnit {task} color="white" />  
  </div>

  <DurationAdjuster {task} {isBulletPoint} {height} />
</div>

<script>
  import DurationAdjuster from '$lib/components/DurationAdjuster.svelte'
  import CalTaskUnit from '$lib/components/CalTaskUnit.svelte'
  import { lazyCallable } from '$lib/utils/svelteActions.js'
  import { pixelsPerHour } from '/src/routes/[user]/components/Calendar/store.js'
  import { calendarBlock } from '$lib/styles/reused.module.css'
  import { getContext } from 'svelte'

  const { openTaskPopup} = getContext('app')
  const { startTaskDrag } = getContext('drag-drop')

  let { task = null } = $props() // assumes `task` is hydrated

  let hasIntersected = $state(false)
  let height = $derived(($pixelsPerHour / 60) * task.duration)
  let isBulletPoint = $derived(height < 24) // 24px is exactly enough to not crop the checkbox and the task name
</script>