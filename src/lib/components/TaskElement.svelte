<div class="relative">
  {#if height < 24 && !task.imageDownloadURL}
    <div 
      onclick={() => openTaskPopup(task)}
      ondragstart={e => startTaskDrag({ e, id: task.id })} 
      draggable="true" 
      class={[
        'relative min-h-[12px] flex flex-col gap-y-1',
      ]}
      style={`height: ${height}px;`}
    >
      <div class="flex items-center w-full">
        <CalTaskUnit {task} color="var(--task-name-color)">
          {#snippet icon ()}
            <DoodleIcon iconTask={task} size={titleFS} scaleToFit />
          {/snippet}
        </CalTaskUnit>
      </div>
    </div>
  {:else}
    <div 
      onclick={() => openTaskPopup(task)}
      ondragstart={e => startTaskDrag({ e, id: task.id })} 
      draggable="true" 
      class={[
        'relative flex flex-col min-h-[24px] gap-y-0',
        'bg-cover bg-center bg-no-repeat',
        calendarBlock
      ]}
      style={`
        height: ${height}px;
        background-color: rgba(255, 255, 255, 0.4);
        border: ${task.imageDownloadURL ? '' : '1px solid rgb(0, 0, 0, 0.1)'};
      `}
      style:background-image={hasIntersected && task.imageDownloadURL
        ? `url(${task.imageDownloadURL})`
        : 'none'}
      use:lazyCallable={() => hasIntersected = true}
    >
      <div class="shrink-0"
        style:padding="var(--left-padding)"
        style:border-radius="var(--left-padding)"
        style:background={task.imageDownloadURL ? `linear-gradient(${COLORS.OVERLAY_DARKEST}, transparent)` : ''}
      >
        <CalTaskUnit {task} color={task.imageDownloadURL ? 'white' : 'var(--task-name-color)'}>
          {#snippet icon ()}
            <DoodleIcon 
              iconTask={task} 
              size={titleFS} 
              whiteVariant={task.imageDownloadURL}
              scaleToFit 
            />
          {/snippet}
        </CalTaskUnit>
      </div>
        
      <div class="grow-1 overflow-hidden" 
        style:padding="0 var(--left-padding)"
      >
        <div style="
          color: {task.imageDownloadURL ? 'white' : 'oklch(43.9% 0 0)'};"
          class="text-xs"
        >
          {task.notes}
        </div>
      </div>
    </div>
  {/if}

  <!-- absolute positioned -->
  <DurationAdjuster {task} 
    onChange={newVal => previewDuration = newVal}
    onInput={async () => {
      Task.update({ 
        id: task.id, 
        kvChanges: { duration: snap(previewDuration, $calSnapInterval) } 
      })
      // let snapshot listener resolve via 1 macrotask, so there is no flash of height change between previewDuration and task.duration
      setTimeout(() => previewDuration = 0, 0)
    }}
  />
</div>

<script>
  import DurationAdjuster from '$lib/components/DurationAdjuster.svelte'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import CalTaskUnit from '$lib/components/CalTaskUnit.svelte'
  import { COLORS } from '$lib/utils/constants.js'
  import { snap } from '$lib/utils/core.js'
  import { calSnapInterval } from '$lib/store'
  import { lazyCallable } from '$lib/utils/svelteActions.js'
  import { calendarBlock, titleFS } from '$lib/styles/reused.module.css'
  import { pixelsPerHour } from '/src/routes/[user]/components/Calendar/store.js'
  import { getContext } from 'svelte'
  
  const { Task } = getContext('app')
  const { openTaskPopup } = getContext('task-popup')
  const { startTaskDrag } = getContext('drag-drop')

  let { task = null } = $props() // assumes `task` is hydrated
  
  let previewDuration = $state(0)
  let height = $derived((previewDuration || task.duration) * $pixelsPerHour / 60)
  let hasIntersected = $state(false)
</script>