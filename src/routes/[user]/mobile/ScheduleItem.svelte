{#if tasksThisDay?.length}
  <div class="day-container">
    <div class="day-header" class:section-complete={completionState.all}>
      <div class="date-group">
        {#if isSpecialDay(simpleDateISO)}
          <span class="day-name">{getDayName(simpleDateISO)}</span>
          <span class="date">{formatDate(simpleDateISO)}</span>
        {:else}
          <span class="date bold">{formatDate(simpleDateISO)}</span>
          <span class="weekday">{formatWeekday(simpleDateISO)}</span>
        {/if}
      </div>
    </div>
    
    <!-- Icon tasks without start time -->
    {#if hasIconTasks}
      <div class="icon-tasks" class:section-complete={completionState.icons}>
        {#each iconTasks as task}
          <div class="icon-task" class:completed={task.isDone}>
            <DoodleIcon iconTask={task} size={32} />
          </div>
        {/each}
      </div>
    {/if}

    <!-- Regular tasks -->
    <div class="tasks-list">
      {#each regularTasks as task}
        <div class="task-item" 
          class:highlight={task.highlight} 
          class:alert={task.alert} 
          class:completed={task.isDone}
          class:has-image={task.imageDownloadURL}
          on:click={() => openTaskPopup(task)} on:keydown
        >
          <div class="task-content">
            <div class="task-indicator">
              {#if task.iconURL}
                <DoodleIcon iconTask={task} size={24} />
              {:else}
                <Checkbox value={task.isDone} on:change={() => toggleTask(task)} />
              {/if}
            </div>
            {#if task.imageDownloadURL}
              <div class="task-image" style="background-image: url({task.imageDownloadURL})">
                {#if task.iconURL}
                  <img class="task-icon-overlay" src={task.iconURL} alt="">
                {/if}
              </div>
            {/if}
            <span class="task-text">{task.name}</span>
            {#if task.startTime}
              <span class="time">{formatTime(task.startTime)}</span>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<script>
  import { DateTime } from 'luxon'
  import Checkbox from '$lib/components/Checkbox.svelte'
  import { openTaskPopup } from '$lib/store'
  import DoodleIcon from '$lib/components/DoodleIcon.svelte'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')

  export let tasksThisDay
  export let simpleDateISO

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

  function isSpecialDay(dateStr) {
    const today = DateTime.now().toFormat('yyyy-MM-dd')
    const tomorrow = DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd')
    const yesterday = DateTime.now().minus({ days: 1 }).toFormat('yyyy-MM-dd')
    
    return dateStr === today || dateStr === tomorrow || dateStr === yesterday
  }

  function getDayName(dateStr) {
    const today = DateTime.now().toFormat('yyyy-MM-dd')
    const tomorrow = DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd')
    const yesterday = DateTime.now().minus({ days: 1 }).toFormat('yyyy-MM-dd')
    
    if (dateStr === today) return 'Today'
    if (dateStr === tomorrow) return 'Tomorrow'
    if (dateStr === yesterday) return 'Yesterday'
    return DateTime.fromISO(dateStr).toFormat('EEE')
  }

  function formatDate(dateStr) {
    return DateTime.fromISO(dateStr).toFormat('MMM dd')
  }

  function formatWeekday(dateStr) {
    return DateTime.fromISO(dateStr).toFormat('EEE')
  }

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
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    overflow: hidden;
  }

  .day-header {
    padding: 14px 16px;
    border-bottom: 1px solid #f1f3f4;
    background: #fff;
  }

  .date-group {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .day-name {
    color: #1a73e8;
    font-weight: 600;
    font-size: 16px;
  }

  .date {
    color: #70757a;
    font-size: 15px;
  }

  .date.bold {
    color: #1a73e8;
    font-weight: 600;
    font-size: 16px;
  }

  .weekday {
    color: #70757a;
    font-size: 15px;
  }

  .icon-tasks {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid #f1f3f4;
  }

  .icon-task {
    width: 32px;
    height: 32px;
    cursor: pointer;
  }

  .tasks-list {
    display: flex;
    flex-direction: column;
  }

  .task-item {
    padding: 14px 16px;
    border-bottom: 1px solid #f1f3f4;
    background: white;
    min-height: 24px;
    cursor: pointer;
  }


  .task-item:last-child {
    border-bottom: none;
  }

  .task-item.has-image {
    padding: 16px;
  }

  .task-item.highlight {
    background: #f8f9fe;
  }

  .task-item.alert {
    background: #fef7f6;
  }

  .task-text {
    flex: 1;
    font-size: 14px;
    line-height: 20px;
    transition: all 0.2s ease;
    color: #202124;
  }

  .task-item.completed {
    background: linear-gradient(to right, rgba(76, 175, 80, 0.04), transparent);
  }

  .task-item.completed .task-text {
    color: #1e8e24; /* Subtle green tint */
  }

  .task-content {
    display: flex;
    align-items: center;
    flex: 1;
    gap: 8px;
    min-height: 24px;
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

  .time {
    color: #70757a;
    font-size: 0.9em;
    min-width: 60px;
    text-align: right;
    transition: color 0.2s ease;
  }

  .task-item.completed .time {
    color: #4caf50;
    opacity: 0.7;
  }

  /* Completion state styles */
  .task-item.completed,
  .icon-tasks.section-complete,
  .day-header.section-complete {
    background: linear-gradient(to right, rgba(76, 175, 80, 0.06), transparent 50%);
  }

  /* Header completion state */
  .day-header.section-complete .day-name,
  .day-header.section-complete .date.bold {
    color: #1e8e24;
  }

  .day-header.section-complete .date:not(.bold),
  .day-header.section-complete .weekday {
    color: #4caf50;
    opacity: 0.7;
  }
</style>