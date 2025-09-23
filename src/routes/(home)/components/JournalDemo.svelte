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
    <h2>Try the photo button</h2>
  </div>

  <div style="display: flex; justify-content: center; gap: 48px;">
    <div style="min-width: {WIDTHS.CALENDAR_DAY_SECTION}px">
      {#if !journalTask.imageDownloadURL}
        <TaskElement task={journalTask} />
      {:else} 
        <PhotoTaskElement task={journalTask} />
      {/if}
    </div>

    <div class="benefits-explanation">
      <p>
        Instead of keeping a separate journal, you can write directly on any task.
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
    row-gap: 36px;
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
</style> 