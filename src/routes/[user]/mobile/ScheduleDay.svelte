{#if tasksThisDay?.length}
  <div class="day-container core-shadow cast-shadow">
    <ScheduleDayHeader
      iso={simpleDateISO} {completionState} 
    />
    
    {#if hasIconTasks}
      <div class="icon-tasks" class:section-complete={completionState.icons}>
        {#each iconTasks as task}
          <div class:completed={task.isDone}>
            <DoodleIcon iconTask={task} size={iconSize} />
          </div>
        {/each}
      </div>
    {/if}

    <div class="tasks-list">
      {#each regularTasks as task}
        <div on:click={() => openTaskPopup(task)}
          class="task-item" 
          class:completed={task.isDone}
          class:has-image={task.imageDownloadURL}
        >
          <div class="task-content">
            <div class="task-indicator">
              {#if task.iconURL}
                <DoodleIcon iconTask={task} size={iconSize} />
              {:else}
                <Checkbox value={task.isDone} onchange={() => toggleTask(task)} />
              {/if}
            </div>
            {#if task.imageDownloadURL}
              <div class="task-image" style="background-image: url({task.imageDownloadURL})">
                {#if task.iconURL}
                  <img class="task-icon-overlay" src={task.iconURL} alt="">
                {/if}
              </div>
            {/if}
            <span class="task-text truncate-to-one-line">
              {task.name}
            </span>
            {#if task.startTime}
              <span class="time">
                {formatTime(task.startTime)}
              </span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<script>
  import ScheduleDayHeader from './ScheduleDayHeader.svelte'
  import Checkbox from '$lib/components/Checkbox.svelte'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import { openTaskPopup } from '$lib/store'
  import { DateTime } from 'luxon'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')

  export let tasksThisDay
  export let simpleDateISO

  const iconSize = 32

  // First split by whether they have a start time
  $: tasksWithoutStartTime = tasksThisDay.filter(task => !task.startTime)
  $: tasksWithStartTime = tasksThisDay.filter(task => task.startTime)

  // Then split the no-start-time tasks by whether they have an icon
  $: iconTasks = tasksWithoutStartTime.filter(task => task.iconURL)
  $: regularTasks = [...tasksWithoutStartTime.filter(task => !task.iconURL), ...tasksWithStartTime]
  $: hasIconTasks = iconTasks.length > 0

  // Encapsulated completion state management
  function getCompletionState(tasks) {
    const { iconTasks, regularTasks, allTasks } = tasks
    
    // Helper to safely check if all tasks in an array are done
    const areAllDone = arr => arr.length > 0 && arr.every(task => task.isDone)
    
    return {
      icons: areAllDone(iconTasks),
      regular: areAllDone(regularTasks),
      all: areAllDone(allTasks)
    }
  }

  // Single reactive statement for all completion states
  $: completionState = getCompletionState({
    iconTasks,
    regularTasks,
    allTasks: tasksThisDay
  })

  function formatTime(time) {
    if (!time) return ''
    return DateTime.fromISO(time).toFormat('h:mma').toLowerCase()
  }

  async function toggleTask(task) {
    await Task.update({ 
      id: task.id,
      keyValueChanges: { isDone: !task.isDone }
    })
  }
</script>

<style>
  :global(body) {
    background: #f1f3f4;
  }

  .day-container {
    background: white;
    /* border: 1px solid #f1f3f4; */
  }

  .icon-tasks {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 8px;
  }

  .tasks-list {
    display: flex;
    flex-direction: column;
  }

  .task-item {
    padding: 12px 8px;
    border-top: 1px solid #f1f3f4;
    background: white;
    min-height: 24px;
    cursor: pointer;
  }

  .task-item.completed {
    background: linear-gradient(to right, rgba(76, 175, 80, 0.04), transparent);
  }

  .task-item.completed .task-text {
    color: #1e8e24; /* Subtle green tint */
  }

  .task-content {
    font-size: 30px; /* set font-size here */

    display: flex;
    align-items: center;
    flex: 1;
    gap: 8px;
  }

  .task-text {
    flex: 1;
    color: #202124;
  }

  .time {
    color: #70757a;
    min-width: 60px;
    text-align: right;
    transition: color 0.2s ease;
  }

  .task-indicator {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .task-image {
    width: 48px;
    height: 48px;
    background-size: cover;
    background-position: center;
    border-radius: 4px;
    position: relative;
  }

  .task-icon-overlay {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    object-fit: contain;
  }

  .task-item.completed .time {
    color: #4caf50;
    opacity: 0.7;
  }

  .task-item.completed,
  .icon-tasks.section-complete {
    background: linear-gradient(to right, rgba(76, 175, 80, 0.06), transparent 50%);
  }
</style>