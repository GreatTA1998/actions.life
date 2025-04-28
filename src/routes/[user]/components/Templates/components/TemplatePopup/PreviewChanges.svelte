<script>
  import { 
    deletingTasks, addingTasks, exceptions, 
    getPreviewSpan, pendingRRStr 
  } from './store.js'
  import PreviewChangesItem from './PreviewChangesItem.svelte'
  import { DateTime } from 'luxon'

  function pluralize (count) {
    return count === 1 ? '' : 's'
  }
</script>

<div class="preview-changes-container">
  <div class="preview-header">
    {#if $pendingRRStr}
      <div class="preview-title">Changing this routine would immediately affect these tasks</div>
      <div class="preview-subtitle">
        Today is {DateTime.now().toFormat('MMM d ccc')}
      </div>
    {/if}
  </div>

  <div class="columns-container">
    {#if $addingTasks.length}
      <div class="column">
        <div class="column-title creation">{$addingTasks.length} addition{pluralize($addingTasks.length)}</div>
        <div class="tasks-list">
          {#each $addingTasks as task (task.startDateISO)}
            <PreviewChangesItem {task} type="creation" />
          {/each}
        </div>
      </div>
    {/if}

    {#if $deletingTasks.length}
      <div class="column">
        <div class="column-title deletion">{$deletingTasks.length} deletion{pluralize($deletingTasks.length)}</div>
        <div class="tasks-list">
          {#each $deletingTasks as task}   
            <PreviewChangesItem {task} type="deletion" />
          {/each}
        </div>
      </div>
    {/if}

    {#if $exceptions.length}
      <div class="column">
        <div class="column-title unchanged">{$exceptions.length} preserved</div>
        <div class="preserved-note">These tasks have been modified and will not be affected by this change.</div>
        <div class="tasks-list">
          {#each $exceptions as task}
            <PreviewChangesItem {task} type="unchanged" />
          {/each}
        </div>
      </div>
    {/if}
  </div>
  <div class="preview-subtitle">
    As each day goes by, new tasks will be auto-generated as needed (preview window: {getPreviewSpan({ rrStr:$pendingRRStr })} days) 
  </div>
</div>

<style>
  .preview-changes-container {
    margin-top: 16px;
    width: 100%;
  }

  .preview-header {
    margin-bottom: 16px;
  }

  .preview-title {
    font-size: 15px;
    font-weight: 500;
  }

  .preview-subtitle {
    font-size: 12px;
    margin-top: 4px;
  }

  .columns-container {
    display: flex;
    gap: 16px;
    margin-top: 12px;
    overflow-x: auto;
    padding-bottom: 8px;
    width: 100%;
  }

  .column {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-width: 0;
    max-width: 33%;
  }

  .column-title {
    font-weight: 600;
    font-size: 14px;
    padding-bottom: 4px;
    border-bottom: 1px solid #eee;
  }

  .tasks-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
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

  .preserved-note {
    font-size: 11px;
    margin-bottom: 8px;
    font-style: italic;
    opacity: 0.8;
    line-height: 1.3;
  }
</style>