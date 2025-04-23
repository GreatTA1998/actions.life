<script>
  import { deletingTasks, addingTasks, exceptions, activeTemplate } from './store.js'
  import { DateTime } from 'luxon'
  
  export let template

  $: activeTemplate.set(template)

  function formatDate(dateStr) {
    const dt = DateTime.fromISO(dateStr)
    return dt.toFormat('MMM d ccc')
  }
</script>

<div class="preview-changes-container">
  <div class="dates-container">
    <div class="dates-column">
      <div style="font-size: 12px;">
        The new periodicity will be continuously applied {(template.previewSpan || 'N/A')} days into the future, 
        with 
        {#if $addingTasks.length}
          <span class="creation">{$addingTasks.length} tasks immediately added</span>
        {/if}
        {#if $deletingTasks.length}
          {#if $addingTasks.length}and {/if}<span class="deletion">{$deletingTasks.length} tasks immediately deleted</span>
        {/if}
        {#if $exceptions.length}
          {#if $addingTasks.length || $deletingTasks.length}and {/if}<span class="unchanged">{$exceptions.length} tasks unchanged</span>
        {/if}
      </div>
      {#each $addingTasks as task (task.startDateISO)}
        <div class="date-item creation">
          <span class="icon">+</span>
          {task.startDateISO}
        </div>
      {/each}

      {#if $deletingTasks}
        {#each $deletingTasks as task}   
          <div class="date-item deletion">
            <span class="icon">-</span>
            {formatDate(task.startDateISO)}
          </div>
        {/each}
      {/if}

      {#if $exceptions.length}
        {#each $exceptions as task}
          <div class="date-item unchanged">
            {formatDate(task.startDateISO)}
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>

<style>
  .preview-changes-container {
    margin-top: 16px;
    width: fit-content;
  }

  .dates-container {
    display: flex;
    gap: 16px;
  }

  .dates-column {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .date-item {
    font-size: 12px;
    display: flex;
    align-items: center;
    white-space: nowrap;
  }

  .deletion {
    color: #e53e3e;
  }

  .creation {
    color: #36a76b;
  }

  .unchanged {
    color: darkblue;
  }

  .icon {
    font-weight: bold;
    margin-right: 6px;
    min-width: 8px;
  }
</style>