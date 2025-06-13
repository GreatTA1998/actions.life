<script>
  import { DateTime } from 'luxon'
  import PhotoLayout from '../../[user]/components/TaskPopup/PhotoLayout.svelte'

  // Minimal task data that expands when photo is added
  let mockTask = {
    id: 'demo-journal',
    name: 'Chicago Marathon',
    isDone: true,
    notes: '', // Start empty for minimal feel
    startTime: '07:00',
    startDateISO: DateTime.now().toISODate(),
    duration: 240, // 4 hours - realistic marathon time
    imageDownloadURL: '',
    photoLayout: 'side-by-side'
  }

  // Use the real train-station.jpeg image
  const mockPhotoURL = '/train-station.jpeg'
  const fullNotes = `FINALLY FINISHED MY FIRST MARATHON. Tired as hell but the scenery was great. They gave food out at the midway stops.`

  let hasPhoto = false

  function simulatePhotoUpload() {
    hasPhoto = true
    mockTask.imageDownloadURL = mockPhotoURL
    mockTask.notes = fullNotes // Add rich content when photo is added
    mockTask = { ...mockTask }
  }

  function resetDemo() {
    hasPhoto = false
    mockTask.imageDownloadURL = ''
    mockTask.notes = '' // Back to minimal
    mockTask = { ...mockTask }
  }
</script>

<div class="demo-section">
  <div class="demo-header">
    <h2>Scheduled Events</h2>
    <p class="demo-hint">Add photos to anything</p>
  </div>
  
  <div class="demo-layout">
    <!-- Left: Task interface -->
    <div class="task-interface">
      <div class="task-popup">
        <PhotoLayout taskObject={mockTask}>
          <div class="task-header">
            <div class="task-checkbox" class:completed={mockTask.isDone}></div>
            <div class="task-title">{mockTask.name}</div>
          </div>

          <div class="task-meta">
            <span class="time-badge">{mockTask.startTime}</span>
            <span class="duration-badge">{Math.floor(mockTask.duration / 60)}h {mockTask.duration % 60}m</span>
          </div>

          {#if hasPhoto}
            <div class="notes-section">
              <textarea 
                value={mockTask.notes} 
                placeholder="Add your thoughts..."
                class="notes-input"
                readonly
              />
            </div>
          {/if}
        </PhotoLayout>
      </div>
    </div>

    <!-- Right: Photo action -->
    <div class="action-panel">
      {#if !hasPhoto}
        <div class="photo-prompt">
          <button class="add-photo-btn" on:click={simulatePhotoUpload}>
            <span>Attach photo</span>
          </button>
        </div>
      {/if}

      <div class="feature-explanation">
        <p>
          Sometimes, it's just easier to directly journal in the calendar. 
          <br><br>
          Anything can have writing and photos attached.
        </p>
      </div>
    </div>
  </div>
</div>

<style>
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

  .demo-layout {
    display: grid;
    grid-template-columns: 1fr 280px;
    gap: 40px;
    align-items: start;
  }

  .task-interface {
    background: #fafafa;
    border: 1px solid #e4e4e7;
    border-radius: 8px;
    padding: 20px;
  }

  .task-popup {
    background: white;
    border-radius: 8px;
    padding: 20px;
    min-height: 280px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .task-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .task-checkbox {
    width: 16px;
    height: 16px;
    border: 1.5px solid #d1d5db;
    border-radius: 3px;
    position: relative;
  }

  .task-checkbox.completed {
    background: #171717;
    border-color: #171717;
  }

  .task-checkbox.completed::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 1px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 1.5px 1.5px 0;
    transform: rotate(45deg);
  }

  .task-title {
    font-size: 18px;
    font-weight: 600;
    color: #171717;
  }

  .task-meta {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .time-badge, .duration-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    background: #f4f4f5;
    color: #71717a;
  }

  .notes-section {
    margin-top: 16px;
  }

  .notes-input {
    width: 100%;
    height: 100px;
    border: 1px solid #e4e4e7;
    border-radius: 6px;
    padding: 12px;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.5;
    resize: none;
    outline: none;
    background: #fafafa;
    color: #525252;
  }

  .action-panel {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 32px;
  }

  .photo-prompt {
    text-align: center;
  }

  .add-photo-btn {
    background: white;
    border: 1px solid #e4e4e7;
    border-radius: 8px;
    padding: 24px 20px;
    cursor: pointer;
    transition: all 0.15s ease;
    font-size: 14px;
    font-weight: 500;
    color: #525252;
    width: 100%;
  }

  .add-photo-btn:hover {
    border-color: #d1d5db;
    background: #fafafa;
  }

  .transformation-info {
    background: white;
    border: 1px solid #e4e4e7;
    border-radius: 8px;
    padding: 20px;
  }

  .transformation-info h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: #171717;
  }

  .transformation-info p {
    margin: 0 0 16px 0;
    font-size: 14px;
    line-height: 1.5;
    color: #525252;
  }

  .reset-btn {
    background: #171717;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .reset-btn:hover {
    background: #262626;
  }

  .feature-explanation {
    max-width: 520px;
    margin: 0 auto;
    padding: 0 0 0 0;
  }

  .feature-explanation p {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: #525252;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .demo-layout {
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .action-panel {
      order: -1;
    }
  }
</style> 