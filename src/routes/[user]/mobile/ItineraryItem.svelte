{#if tasksThisDay?.length}
  <div class="day-container">
    <div class="day-header">
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
      <div class="icon-tasks">
        {#each iconTasks as task}
          <div class="icon-task" class:completed={task.isDone}>
            <img src={task.iconURL} alt="" on:click={() => toggleTask(task)}>
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
        >
          <label class="checkbox-container">
            {#if !task.iconURL}
              <input type="checkbox" checked={task.isDone} on:change={() => toggleTask(task)}>
            {/if}
            <div class="task-content" on:click={() => task.iconURL ? toggleTask(task) : null}>
              {#if task.imageDownloadURL}
                <div class="task-image" style="background-image: url({task.imageDownloadURL})">
                  {#if task.iconURL}
                    <img class="task-icon-overlay" src={task.iconURL} alt="">
                  {/if}
                </div>
              {:else if task.iconURL}
                <img class="task-icon" src={task.iconURL} alt="">
              {/if}
              <span class="task-text">{task.name}</span>
              {#if task.startTime}
                <span class="time">{formatTime(task.startTime)}</span>
              {/if}
            </div>
          </label>
        </div>
      {/each}
    </div>
  </div>
{/if}

<script>
  import { DateTime } from 'luxon'
  import { updateFirestoreDoc } from '$lib/db/helpers.js'
  
  export let tasksThisDay
  export let simpleDateISO

  $: iconTasks = tasksThisDay.filter(task => task.iconURL && !task.startTime)
  $: regularTasks = tasksThisDay.filter(task => !task.iconURL || task.startTime)
  $: hasIconTasks = iconTasks.length > 0

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
    await updateFirestoreDoc(`users/${task.uid}/tasks/${task.id}`, {
      isDone: !task.isDone
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

  .icon-task img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .icon-task.completed img {
    opacity: 0.6;
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

  .task-item.completed .task-text {
    text-decoration: line-through;
    color: #70757a;
  }

  .checkbox-container {
    display: flex;
    align-items: center;
    width: 100%;
    cursor: pointer;
    min-height: 24px;
  }

  .task-content {
    display: flex;
    align-items: center;
    flex: 1;
    gap: 12px;
    cursor: pointer;
    min-height: 24px;
  }

  .task-image {
    width: 48px;
    height: 48px;
    background-size: cover;
    background-position: center;
    border-radius: 4px;
    position: relative;
  }

  .task-icon {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }

  .task-icon-overlay {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 20px;
    height: 20px;
    object-fit: contain;
  }

  .task-text {
    flex: 1;
    margin: 0 8px;
    font-size: 14px;
    line-height: 20px;
  }

  .time {
    color: #70757a;
    font-size: 0.9em;
    min-width: 60px;
    text-align: right;
  }

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    margin: 0;
    border-radius: 3px;
    border: 2px solid #dadce0;
    background: white;
    cursor: pointer;
  }

  input[type="checkbox"]:checked {
    background: #4285f4;
    border-color: #4285f4;
  }
</style>