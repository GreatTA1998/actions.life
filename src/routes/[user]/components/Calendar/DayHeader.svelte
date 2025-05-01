<script>
  import CreateTaskDirectly from '$lib/components/CreateTaskDirectly.svelte'
  import FlexibleDayTask from '$lib/components/FlexibleDayTask.svelte'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'

  import Task from '$lib/db/models/Task.js'
  import { activeDragItem } from '$lib/store'
  import { DateTime } from 'luxon'

  import { treesByDate } from './service.js'
  import { headerExpanded, isCompact } from './store.js'

  export let dt 

  $: ISODate = dt.toFormat('yyyy-MM-dd')

  let isDirectlyCreatingTask = false

  function dragover_handler(e) {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
  }

  function drop_handler(e, ISODate) {
    const id = e.dataTransfer.getData('text/plain')
    if (!id) return // it means we're adjusting the duration but it triggers a drop event, and a dragend event must be followed by a drop event

    e.preventDefault()
    e.stopPropagation()

    const dt = DateTime.fromISO(ISODate)

    Task.update({
      id,
      keyValueChanges: {
        startTime: '',
        startDateISO: dt.toFormat('yyyy-MM-dd')
      }
    })

    activeDragItem.set(null)
  }
</script>

<div class="day-header"
  style:padding={$isCompact ? '8px 0px' : 'var(--height-main-content-top-margin) 0px'}
  on:click|self={() => (isDirectlyCreatingTask = true)} on:keydown
  on:dragover={(e) => dragover_handler(e)}
  on:drop={(e) => drop_handler(e, ISODate)}
>
  <div class="compact-horizontal unselectable">
    <div class="center-flex day-name-label"
      class:active-day-name={ISODate <= DateTime.now().toFormat('yyyy-MM-dd')}
    >
      {DateTime.fromISO(ISODate).toFormat('ccc')}
    </div>

    <div class="center-flex" style="font-size: 16px; font-weight: 300">
      <div class="center-flex" style="padding: 0px 0px; width: 28px;"
        class:active-date-number={ISODate <= DateTime.now().toFormat('yyyy-MM-dd')}
      >
        {DateTime.fromISO(ISODate).toFormat('dd')}
      </div>
    </div>
  </div>

  {#if $headerExpanded}
    <div style="overflow: hidden; margin-top: {$isCompact ? '0' : '4'}px;">
      {#if $treesByDate[ISODate]}
        <div style="display: flex; flex-wrap: wrap;">
          {#each $treesByDate[ISODate].noStartTime.hasIcon as iconTask (iconTask.id)}
            <DoodleIcon {iconTask} />
          {/each}
        </div>

        <div style="display: flex; flex-direction: column; row-gap: {$isCompact ? '4px' : '8px'};">
          {#each $treesByDate[ISODate].noStartTime.noIcon as flexibleDayTask (flexibleDayTask.id)}
            <div class="flexible-day-task">
              <FlexibleDayTask task={flexibleDayTask} />
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  {#if isDirectlyCreatingTask}
    <div id="calendar-direct-task-div">
      <CreateTaskDirectly
        newTaskStartTime={''}
        resultantDateClassObject={DateTime.fromISO(ISODate).toJSDate()}
        on:reset={() => (isDirectlyCreatingTask = false)}
      />
    </div>
  {/if}
</div>

<style>
  #calendar-direct-task-div {
    width: 90%; 
    padding-left: 0px; 
    padding-right: 0px;
  }

  .flexible-day-task {
    display: flex;
    width: var(--width-calendar-day-section); 
    gap: 4px; 

    font-size: 12px; 
    margin-top: 0px; margin-left: 4px; margin-right: 4px; 
  }

  .compact-horizontal {
    display: flex; 
    justify-content: center;
  }

  .day-header {
    width: var(--width-calendar-day-section);
    padding-top: var(--main-content-top-margin);
    padding-bottom: 18px;

    font-size: 1.4em;
    background-color: var(--calendar-bg-color);
    color: #6d6d6d;
  }

  .day-name-label {
    font-size: 16px;
    margin-bottom: 0px;
    font-weight: 400;
  }

  .active-day-name {
    color: rgb(30, 30, 30);
  }

  .active-date-number {
    font-weight: 300;
    color: rgb(60, 60, 60);
  }

  .center-flex {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>