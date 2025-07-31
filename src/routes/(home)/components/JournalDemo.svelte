<script>
  import { DateTime } from 'luxon'
  import TaskPopupContent from '../../[user]/components/TaskPopup/TaskPopupContent.svelte'
  import { getContext } from 'svelte'

  const { tasksCache, clickedTaskID, memoryTree, Task } = getContext('app')

  let hasPhoto = false

  $: journalTask = $memoryTree[5]
  $: if (journalTask) init()

  function init () {
    tasksCache.update(cache => {
      cache[journalTask.id] = journalTask
      return cache
    })

    clickedTaskID.set(journalTask.id)
  }

  function simulatePhotoUpload () {
    Task.update({
      id: journalTask.id,
      keyValueChanges: {
        imageDownloadURL: '/optimized_camino.jpg',
        notes: `Finally reached the end. Tired as hell but the scenery was great. Met some really great folks...`
      }
    })
    hasPhoto = true
  }
</script>

<div class="demo-section">
  <div class="demo-header">
    <h2>Click the photo button</h2>
    <p class="demo-hint">and write about anything you've done</p>
  </div>

  {#if $clickedTaskID && $tasksCache[$clickedTaskID]}
    <div style="background: white; border-radius: 24px; overflow: hidden;">
      <TaskPopupContent />
    </div>
  {/if}

  <div class="action-panel">
    {#if !hasPhoto}
      <div class="photo-prompt">
        <button class="add-photo-btn" on:click={simulatePhotoUpload}>
          <span>Add example photo</span>
        </button>
      </div>
    {/if}

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
  /* same styles as the timeline toggle button */
  .add-photo-btn {
    background-color: #f6f6f7;
    color: #6e6e7a;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
  }

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