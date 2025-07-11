<script>
  import { DateTime } from 'luxon'
  import TaskPopupContent from '../../[user]/components/TaskPopup/TaskPopupContent.svelte'
  import { getContext } from 'svelte'

  const { tasksCache, clickedTaskID } = getContext('app')

  // Minimal task data that expands when photo is added
  let mockTask = {
    id: 'demo-journal',
    name: 'End of trail',
    isDone: true,
    notes: '', // Start empty for minimal feel
    startTime: '07:00',
    startDateISO: DateTime.now().toISODate(),
    duration: 240, // 4 hours - realistic marathon time
    imageDownloadURL: '',
    photoLayout: 'side-by-side'
  }

  let hasPhoto = false

  tasksCache.update(cache => {
    cache[mockTask.id] = mockTask
    return cache
  })
  clickedTaskID.set(mockTask.id)

  function simulatePhotoUpload() {
    mockTask.imageDownloadURL = '/optimized_camino.jpg'
    mockTask.notes = `FINALLY FINISHED MY FIRST MARATHON. Tired as hell but the scenery was great. They gave food out at the midway stops.`
    mockTask = mockTask
    tasksCache.update(cache => {
      cache[mockTask.id] = mockTask
      return cache
    })
    console.log('mockTask =', mockTask)

    hasPhoto = true
  }
</script>

<div class="demo-section">
  <div class="demo-header">
    <h2>Click the photo button</h2>
    <p class="demo-hint">to add a photo to the task</p>
  </div>

  {#if $clickedTaskID && $tasksCache[$clickedTaskID]}
    <TaskPopupContent />
  {/if}

  <div class="action-panel">
    {#if !hasPhoto}
      <div class="photo-prompt">
        <button class="add-photo-btn" on:click={simulatePhotoUpload}>
          <span>Attach photo</span>
        </button>
      </div>

      <div class="feature-explanation">
        <p>
          Sometimes, it's just easier to directly journal in the calendar. 
          <br><br>
          Anything can have writing and photos attached.
        </p>
      </div>
    {/if}
  </div>
</div>

<style>
  .add-photo-btn {
    background-color: #000;
    color: #fff;
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
  }

  .demo-header {
    text-align: center;
    margin-bottom: 40px;
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