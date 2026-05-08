{#if height < 24 && !task.imageDownloadURL}
  <div 
    onclick={() => openTaskPopup(task)}
    ondragstart={e => startTaskDrag({ e, id: task.id, isFromCal: true })} 
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

      <DurationAdjuster {task} {height} />
    </div>
  </div>
{:else}
  <div 
    onclick={() => openTaskPopup(task)}
    ondragstart={e => startTaskDrag({ e, id: task.id, isFromCal: true })} 
    draggable="true" 
    class={[
      'relative flex flex-col min-h-[24px] gap-y-0',
      'bg-cover bg-center bg-no-repeat',
      calendarBlock
    ]}
    style={`
      height: ${height}px;
      background-color: rgba(250, 250, 250, 0.1);
      border: ${task.imageDownloadURL ? '' : '1px solid rgb(0, 0, 0, 0.1)'};
    `}
    style:background-image={hasIntersected && task.imageDownloadURL
      ? `linear-gradient(rgba(0, 0, 0, 0.2), transparent), url(${task.imageDownloadURL})`
      : 'none'}
    use:lazyCallable={() => hasIntersected = true}
  >
    <div class="shrink-0"
      style:padding="var(--left-padding)"
      style:border-radius="var(--left-padding)"
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

    <DurationAdjuster {task} {height} />
  </div>
{/if}

<script>
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import DurationAdjuster from '$lib/components/DurationAdjuster.svelte'
  import CalTaskUnit from '$lib/components/CalTaskUnit.svelte'
  import { lazyCallable } from '$lib/utils/svelteActions.js'
  import { calendarBlock } from '$lib/styles/reused.module.css'
  import { pixelsPerHour } from '/src/routes/[user]/components/Calendar/store.js'
  import { titleFS } from '$lib/styles/reused.module.css'
  import { getContext } from 'svelte'
  
  const { openTaskPopup } = getContext('app')
  const { startTaskDrag } = getContext('drag-drop')

  let { task = null } = $props() // assumes `task` is hydrated

  let height = $derived($pixelsPerHour / 60 * task.duration)
  let hasIntersected = $state(false)
</script>