<script>
  import TaskElement from '$lib/components/TaskElement.svelte'
  import PhotoTaskElement from '$lib/components/PhotoTaskElement.svelte'
  import { WIDTHS } from '$lib/utils/constants.js'
  import { getContext } from 'svelte'

  const { tasksCache } = getContext('app')

  let journalTask = $derived($tasksCache['End of trail'])
</script>

<div class="demo-section">
  <div class="demo-header">
    <h2>Click the photo button</h2>
    <p class="demo-hint">and write about anything you've done</p>
  </div>

  <div style="width: {WIDTHS.CALENDAR_DAY_SECTION}px">
    {#if !journalTask.imageDownloadURL}
      <TaskElement task={journalTask} />
    {:else} 
      <PhotoTaskElement task={journalTask} />
    {/if}
  </div>

  <div class="action-panel">
    <div class="feature-explanation">
      <p>
        Anything can have writing and photos attached.
        Instead of keeping a separate journal, it's often easier to journal directly on the task itself.
        The calendar becomes a contextual life log for not just events, but memories.
      </p>
    </div>
  </div>
</div>

<style>
  .demo-section {
    max-width: 1000px;
    margin: 48px auto;
    padding: 0 24px;
    display: flex;
    flex-direction: column;
    row-gap: 24px;
  }

  .demo-header {
    text-align: center;
  }

  .demo-header h2 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
    color: #171717;
    letter-spacing: -0.01em;
  }

  .demo-hint {
    margin: 8px 0 0 0;
    font-size: 16px;
    color: #71717a;
    font-weight: 400;
  }
</style> 