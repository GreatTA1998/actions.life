{#if height < 24 && !task.imageDownloadURL}
  <div 
    onclick={() => openTaskPopup(task)}
    ondragstart={e => startTaskDrag({ e, id: task.id, isFromCal: true })} 
    draggable="true" 
    class={[
      'relative min-h-[12px] flex flex-col gap-y-1',
    ]}
    style={`
      height: ${height}px;
      opacity: ${task.isDone ? '1.0' : '0.7'};`
    }
  >
    <div class="flex items-center w-full">
      <div class="flex items-center" style="
        margin-right: calc(var(--left-padding) - 2px);
        color: {task.isDone ? '#509c13' : 'rgb(20, 20, 20)'};"
      >
        <MslCircle style="font-size: 2px;"/>
      </div>

      <CalTaskUnit {task} color="black">
        {#snippet icon ()}
          <DoodleIcon iconTask={task} size={14} 
            extraStyle="
              transform: scale(1.5);
              {task.isDone ? 
                '' : 
                'filter: grayscale(90%) opacity(0.5)'}
            "
          />
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
      'relative flex flex-col min-h-[24px] gap-y-1',
      'bg-cover bg-center bg-no-repeat',
      calendarBlock
    ]}
    style={`
      height: ${height}px;
      background-color: rgba(0, 0, 50, 0.04);
      border: ${task.imageDownloadURL ? '' : '1px solid rgb(0, 0, 0, 0.1)'};
    `}
    style:background-image={hasIntersected && task.imageDownloadURL
      ? `linear-gradient(rgba(0, 0, 0, 0.5), transparent), url(${task.imageDownloadURL})`
      : 'none'}
    use:lazyCallable={() => hasIntersected = true}
  >
    <div 
      style:padding="var(--left-padding)"
      style:border-radius="var(--left-padding)"
      style:opacity={task.isDone ? '1.0' : '0.7'}
    >
      <CalTaskUnit {task} color={task.imageDownloadURL ? 'white' : 'black'}>
        {#snippet icon ()}
          {#if task.imageDownloadURL}
            <DoodleIcon iconTask={task} size={14} 
              extraStyle="
                transform: scale(1.5);
                {task.isDone ? 
                  'filter: brightness(0) invert(1)' : 
                  'filter: brightness(0) invert(1) opacity(0.5)'}
              "
            />
          {:else}
            <DoodleIcon iconTask={task} size={14} 
              extraStyle="
                transform: scale(1.5);
                {task.isDone ? 
                  '' : 
                  'filter: grayscale(90%) opacity(0.5)'
                }
              "
            />
          {/if}
        {/snippet}
      </CalTaskUnit>
    </div>
      
    {#if !task.imageDownloadURL}
      <div class="grow-1 overflow-hidden" 
        style:padding-left="var(--left-padding)"   
        style:opacity={task.isDone ? '1.0' : '0.7'}
      >
        <div style="
          font-size: {notesFS}; 
          font-weight: 300; 
          color: {task.imageDownloadURL ? 'white' : 'black'};"
        >
          {task.notes}
        </div>
      </div>
    {/if}

    <DurationAdjuster {task} {height} />
  </div>
{/if}

<script>
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import DurationAdjuster from '$lib/components/DurationAdjuster.svelte'
  import CalTaskUnit from '$lib/components/CalTaskUnit.svelte'
  import MslCircle from 'virtual:icons/material-symbols-light/circle'
  import { lazyCallable } from '$lib/utils/svelteActions.js'
  import { calendarBlock, notesFS } from '$lib/styles/reused.module.css'
  import { pixelsPerHour } from '/src/routes/[user]/components/Calendar/store.js'
  import { getContext } from 'svelte'
  
  const { openTaskPopup } = getContext('app')
  const { startTaskDrag } = getContext('drag-drop')

  let { task = null } = $props() // assumes `task` is hydrated

  let height = $derived($pixelsPerHour / 60 * task.duration)
  let hasIntersected = $state(false)
</script>