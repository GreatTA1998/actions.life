<script>
  import { DateTime } from 'luxon'
  
  export let task
  export let type = 'unchanged' // can be 'creation', 'deletion', or 'unchanged'

  function formatDate(dateStr) {
    const dt = DateTime.fromISO(dateStr)
    return dt.toFormat('MMM d ccc')
  }

  $: hasImage = task.imageDownloadURL && task.imageDownloadURL.length > 0
  $: backgroundStyle = hasImage ? `background-image: url(${task.imageDownloadURL}); background-size: cover; background-position: center; background-blend-mode: lighten; background-opacity: 0.1;` : ''
</script>

<div class="task-item {type}" style={backgroundStyle}>
  <div class="task-overlay"></div>
  <div class="task-content">
    <div class="task-header">
      {#if type === 'creation'}
        <span class="icon">+</span>
      {:else if type === 'deletion'}
        <span class="icon">-</span>
      {/if}
      <span class="date">{formatDate(task.startDateISO)}</span>
      {#if task.duration}
        <span class="duration">{task.duration} min</span>
      {/if}
    </div>
    
    <div class="task-body">
      {#if task.notes}
        <div class="description">{task.notes}</div>
      {/if}
    </div>
  </div>
</div>

<style>
  .task-item {
    padding: 4px 8px;
    border-radius: 4px;
    background-color: rgba(0, 0, 0, 0.03);
    position: relative;
    overflow: hidden;
  }

  .task-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.65);
    z-index: 1;
  }

  .task-content {
    position: relative;
    z-index: 2;
  }

  .task-header {
    display: flex;
    align-items: center;
    font-size: 12px;
  }

  .icon {
    font-weight: bold;
    margin-right: 6px;
    min-width: 8px;
  }

  .date {
    font-weight: 500;
  }

  .duration {
    margin-left: auto;
    opacity: 0.7;
  }

  .task-body {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    font-size: 11px;
  }

  .description {
    opacity: 0.9;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .creation {
    color: #36a76b;
  }

  .deletion {
    color: #e53e3e;
  }

  .unchanged {
    color: darkblue;
  }
</style>
