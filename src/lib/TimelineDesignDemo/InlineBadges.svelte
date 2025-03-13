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

<div class="timeline-item" style="margin-left: {level * 40}px;">
  <div class="timeline-line"></div>
  
  <div class="task-content">
    <div class="circle" class:completed={task.completed}></div>
    <div class="task-text">{task.text}</div>
    
    {#if task.date}
      <div class="date-badge">{formatDate(task.date)}</div>
    {/if}
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
  
  .date-badge {
    font-size: 11px;
    background-color: #f0f0f0;
    border-radius: 10px;
    padding: 2px 6px;
    margin-left: 8px;
    color: #666;
  }
</style> 