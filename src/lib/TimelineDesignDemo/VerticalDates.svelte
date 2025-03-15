<script>
  export let task;
  export let level = 0;
  
  function formatDate (dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<div class="timeline-item" style="margin-left: {level * 20}px;">
  <div class="task-row">
    {#if task.date}
      <div class="date-badge">{formatDate(task.date)}</div>
    {/if}
    
    <div class="task-text">{task.text}</div>
  </div>
  
  {#if task.children && task.children.length > 0}
    <div class="children-container">
      <!-- Only add vertical line for non-root tasks -->
      {#if level > 0}
        <div class="vertical-line"></div>
      {/if}
      
      {#each task.children as child, index}
        <svelte:self task={child} level={level + 1} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .timeline-item {
    position: relative;
    margin-bottom: 8px;
  }
  
  .task-row {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 1;
    margin-bottom: 5px;
  }
  
  .task-text {
    font-size: 14px;
    margin-left: 10px;
  }
  
  .children-container {
    position: relative;
    padding-left: 20px;
    margin-top: 5px;
  }
  
  /* Single vertical line for children */
  .vertical-line {
    position: absolute;
    top: 0;
    /* Center the line with the date badge */
    left: 30px;
    width: 2px;
    height: 100%;
    background-color: #ddd;
    z-index: 0;
  }
  
  .date-badge {
    min-width: 60px;
    font-size: 12px;
    color: #666;
    padding: 2px 4px;
    border-radius: 3px;
    border: 1px solid #ddd;
    background-color: white;
    text-align: center;
  }
</style> 