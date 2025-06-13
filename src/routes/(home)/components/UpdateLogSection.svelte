<script>
  import TimelineRenderer from '../../[user]/components/TaskTree/TimelineRenderer.svelte'
  import TaskProvider from '../../../lib/components/TaskProvider.svelte'
  import { writable } from 'svelte/store'
  import { DateTime } from 'luxon'

  // Create reactive stores for side panel state
  let selectedUpdate = null

  // Mock dependencies for our components
  const mockTaskService = {
    update: ({ id, keyValueChanges }) => {
      console.log('Demo: Would update task', id, 'with', keyValueChanges)
    }
  }

  const mockDragStore = writable(null)
  
  function openUpdateDetails(update) {
    selectedUpdate = update
  }

  // Convert updates to task format for TimelineRenderer
  const updateTasks = [
    {
      id: "update-3",
      name: "actions.life",
      isDone: true,
      isCollapsed: false,
      startDateISO: "2025-06-12",
      startTime: "16:00",
      duration: 60,
      notes: "Revolutionary photo integration that transforms task layouts based on visual content.",
      children: [],
      childrenLayout: 'normal',
      version: "0.8.0",
      type: "feature",
      highlights: [
        "Dynamic layout switching for photo tasks",
        "Side-by-side photo and notes view",
        "Enhanced visual memory context"
      ]
    },
    {
      id: "update-2",
      name: "intentions.life",
      isDone: true,
      isCollapsed: false,
      startDateISO: "2024-01-01",
      startTime: "11:45",
      duration: 45,
      notes: "Complete overhaul of the timeline visualization with better chronological organization.",
      children: [],
      childrenLayout: 'normal',
      version: "0.8.1",
      type: "improvement",
      highlights: [
        "Cleaner timeline layouts",
        "Better task dependency visualization",
        "Improved switch between normal and timeline views"
      ]
    },
    {
      id: "update-1",
      name: "organize-life.com",
      isDone: true,
      isCollapsed: false,
      startDateISO: "2022-01-01",
      startTime: "13:20",
      duration: 30,
      notes: "Added visual habit completion with double-click interactions and improved icon display.",
      children: [],
      childrenLayout: 'normal',
      version: "0.8.2",
      type: "feature",
      highlights: [
        "Real-time habit completion feedback",
        "Updated Firebase icon integration",
        "Improved mobile responsiveness"
      ]
    }
  ]

  function getTypeIcon(type) {
    switch(type) {
      case 'feature': return '🚀'
      case 'improvement': return '✨'
      case 'fix': return '🔧'
      default: return '📝'
    }
  }

  function getTypeColor(type) {
    switch(type) {
      case 'feature': return '#10b981'
      case 'improvement': return '#3b82f6'
      case 'fix': return '#f59e0b'
      default: return '#6b7280'
    }
  }
</script>

<div class="updates-section">
  <div class="section-header">
    <h2>Update Log</h2>
  </div>

  <div class="interactive-timeline">
    <div class="details-column">
      {#if selectedUpdate}
        <div class="details-panel">
          <div class="panel-header">
            <div class="version-badge" style="background-color: {getTypeColor(selectedUpdate.type)}20; color: {getTypeColor(selectedUpdate.type)}">
              <span class="version-icon">{getTypeIcon(selectedUpdate.type)}</span>
              <span class="version-text">v{selectedUpdate.version}</span>
              <span class="version-type">{selectedUpdate.type}</span>
            </div>
          </div>

          <h3 class="update-title">{selectedUpdate.name}</h3>
          
          <div class="panel-content">
            <div class="content-section">
              <h4>What's New</h4>
              <div class="highlights-list">
                {#each selectedUpdate.highlights as highlight}
                  <div class="highlight-item">
                    <span class="highlight-bullet" style="color: {getTypeColor(selectedUpdate.type)}">•</span>
                    <span class="highlight-text">{highlight}</span>
                  </div>
                {/each}
              </div>
            </div>

            <div class="content-section">
              <h4>Description</h4>
              <p class="description-text">{selectedUpdate.notes}</p>
            </div>
          </div>
        </div>
      {:else}
        <div class="welcome-message">
          This will re-use the task popup. It's a creative way to write a lot more in depth about actions.life, the insights used, and the design philosophy.
          At the bottom, include the call to action AND the Github codebase. You never know, accumulating stars is never a bad thing.
        </div>
      {/if}
    </div>

    <div class="timeline-column">
      <TaskProvider 
        taskService={mockTaskService}
        dragStore={mockDragStore}
        popupHandler={openUpdateDetails}
      >
        <div class="timeline-container">
          <TimelineRenderer
            children={updateTasks}
            parentID="updates-root"
            depth={0}
            ancestorRoomIDs={[]}
            isLargeFont={false}
          />
        </div>
      </TaskProvider>
    </div>



  </div>
</div>

<style>
  .updates-section {
    max-width: 1200px;
    margin: 80px auto;
    padding: 0 24px;
  }

  .section-header {
    margin-bottom: 56px;
  }

  .section-header h2 {
    margin: 0 0 12px 0;
    font-size: 32px;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: -0.02em;
  }

  .section-subtitle {
    margin: 0;
    font-size: 18px;
    color: #6b7280;
    font-weight: 400;
  }

  .interactive-timeline {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 48px;
    margin-bottom: 56px;
    min-height: 600px;
  }

  .timeline-column {
    background: #fafafa;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 24px;
    overflow-y: auto;
    max-height: 700px;
  }

  .timeline-container {
    position: relative;
  }

  .details-column {
    display: flex;
    flex-direction: column;
  }

  .details-panel {
    background: var(--offwhite-bg);
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .panel-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
  }

  .version-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    width: fit-content;
  }

  .version-icon {
    font-size: 16px;
  }

  .version-type {
    text-transform: uppercase;
    font-size: 12px;
    letter-spacing: 0.5px;
  }

  .update-title {
    margin: 0;
    padding: 0 24px 20px 24px;
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .panel-content {
    flex: 1;
    padding: 0 24px 24px 24px;
    overflow-y: auto;
  }

  .content-section {
    margin-bottom: 32px;
  }

  .content-section:last-child {
    margin-bottom: 0;
  }

  .content-section h4 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .highlights-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .highlight-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .highlight-bullet {
    font-weight: bold;
    margin-top: 2px;
    flex-shrink: 0;
  }

  .highlight-text {
    font-size: 14px;
    color: #374151;
    line-height: 1.5;
  }

  .description-text {
    margin: 0;
    font-size: 14px;
    color: #6b7280;
    line-height: 1.6;
  }

  .welcome-message {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 48px 32px;
    text-align: center;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  /* Mobile responsive */
  @media (max-width: 1024px) {
    .interactive-timeline {
      grid-template-columns: 1fr;
      gap: 32px;
    }

    .details-column {
      order: -1;
    }

    .timeline-column {
      max-height: 500px;
    }
  }

  @media (max-width: 768px) {
    .section-header h2 {
      font-size: 28px;
    }

    .section-subtitle {
      font-size: 16px;
    }

    .welcome-message {
      padding: 32px 24px;
    }

    .roadmap-note {
      padding: 24px;
    }
  }
</style> 