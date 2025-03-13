<script>
  export let task;
  export let level = 0;
  
  // Format date for display
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<div class="timeline-item" style="margin-left: {level * 16}px;">
  <div class="timeline-line"></div>
  
  {#if task.date}
    <div class="date-indicator">
      <div class="date-marker"></div>
      <div class="date-label">{formatDate(task.date)}</div>
    </div>
  {/if}
  
  <div class="task-content">
    <div class="circle" class:completed={task.completed}></div>
    <div class="task-text">{task.text}</div>
  </div>
  
  {#if task.children && task.children.length > 0}
    <div class="children-container">
      {#each task.children as child}
        <svelte:self task={child} level={level + 1} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .timeline-item {
    position: relative;
    padding-left: 20px;
    margin-bottom: 15px;
  }
  
  .timeline-line {
    position: absolute;
    top: 0;
    left: 8px;
    width: 2px;
    height: 100%;
    background-color: #ddd;
    z-index: 0;
  }
  
  .task-content {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1;
  }
  
  .circle {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid #ccc;
    background-color: white;
    margin-right: 10px;
  }
  
  .circle.completed {
    background-color: #4CAF50;
    border-color: #4CAF50;
  }
  
  .task-text {
    font-size: 14px;
  }
  
  .children-container {
    margin-top: 10px;
  }
  
  .date-indicator {
    position: absolute;
    left: -40px;
    display: flex;
    align-items: center;
  }
  
  .date-marker {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #4CAF50;
    left: 0;
    transform: translateX(-5px);
  }
  
  .date-label {
    position: absolute;
    left: 10px;
    font-size: 12px;
    color: #666;
    white-space: nowrap;
  }
</style> 