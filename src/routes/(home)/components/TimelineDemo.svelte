<script>
  import RecursiveTask from '../../[user]/components/TaskTree/RecursiveTask.svelte'
  import TaskProvider from '../../../lib/components/TaskProvider.svelte'
  import ToggleGroup from '../../../lib/components/ToggleGroup.svelte'
  import { DateTime } from 'luxon'
  import { writable } from 'svelte/store'
  import '../../../lib/styles/demo-shared.css'
  
  let isTimelineView = false

  // Create mock dependencies for demo
  const mockTaskService = {
    update: ({ id, keyValueChanges }) => {
      console.log('Demo: Would update task', id, 'with', keyValueChanges)
      // Update the demo data for visual feedback
      updateDemoTask(id, keyValueChanges)
    },
    create: ({ id, newTaskObj }) => {
      console.log('Demo: Would create task', id, newTaskObj)
    }
  }

  const mockDragStore = writable(null)
  
  const mockPopupHandler = (task) => {
    console.log('Demo: Would open popup for task:', task.name)
  }

  function updateDemoTask(id, changes) {
    function updateTaskRecursive(task) {
      if (task.id === id) {
        Object.assign(task, changes)
        return true
      }
      for (let child of task.children) {
        if (updateTaskRecursive(child)) return true
      }
      return false
    }
    
    updateTaskRecursive(demoTaskData)
    // Trigger reactivity
    demoTaskData = { ...demoTaskData }
  }

  // Simple milestone-based data that makes timeline view obviously better
  let demoTaskData = {
    id: 'demo-root',
    name: 'Running',
    isDone: false,
    isCollapsed: false,
    startDateISO: '2024-01-01',
    childrenLayout: isTimelineView ? 'timeline' : 'normal',
    children: [
      {
        id: 'demo-1',
        name: 'Start training',
        isDone: true,
        isCollapsed: false,
        startDateISO: '2024-01-01',
        childrenLayout: 'normal',
        children: []
      },
      {
        id: 'demo-3',
        name: 'Break 25:00 in 5K',
        isDone: true,
        isCollapsed: false,
        startDateISO: '2024-04-01',
        childrenLayout: 'normal',
        children: []
      },
      {
        id: 'demo-4',
        name: 'Boston Marathon',
        isDone: false,
        isCollapsed: false,
        startDateISO: '2024-04-15',
        childrenLayout: 'normal',
        children: []
      },
      {
        id: 'demo-5',
        name: 'Chicago Marathon',
        isDone: false,
        isCollapsed: false,
        startDateISO: '2025-10-13',
        childrenLayout: 'normal',
        children: []
      }
    ]
  }

  // Update childrenLayout when toggle changes
  $: {
    demoTaskData.childrenLayout = isTimelineView ? 'timeline' : 'normal'
  }

  function toggleView (newLayout) {
    demoTaskData.childrenLayout = newLayout
    isTimelineView = newLayout === 'timeline'
    demoTaskData = { ...demoTaskData }
  }
</script>

<div class="demo-section">
  <div class="demo-header">
    <h2>Long-term timelines</h2>
    <p class="demo-hint">Every task tree can be displayed as a timeline</p>
  </div>
  
  <div class="demo-layout">
    <div class="task-tree-column">
      <div style="width: 240px;">
        <ToggleGroup 
          options={[
            { text: 'normal', value: 'normal' }, 
            { text: 'timeline', value: 'timeline' }
          ]} 
          activeValue={demoTaskData.childrenLayout}
          on:select={e => toggleView(e.detail.value)}
        />
      </div>
      
      <TaskProvider 
        taskService={mockTaskService}
        dragStore={mockDragStore}
        popupHandler={mockPopupHandler}
      >
        <RecursiveTask 
          taskObj={demoTaskData}
          depth={0}
          willShowCheckbox={true}
          ancestorRoomIDs={[]}
          isLargeFont={false}
        />
      </TaskProvider>
    </div>

    <div class="controls-panel">
      <div class="benefits-explanation">
        <p>
          Most calendars lock us into rigid timeframes: week, month, year. But our most important endeavors often span arbitrary, incompatible timeframes.
          <br><br>
          In actions.life, timelines are a first-class construct—an alternative display mode to task trees. They allow long-term priorities to be coordinated together without leaving the calendar page.
          <br><br>
          Timelines put deadlines in perspective, connect day-to-day tasks to larger goals, and fundamentally encourages us to think on the long-horizon.
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  .demo-section {
    max-width: 1100px;
    margin: 48px auto;
    padding: 0 24px;
  }

  .demo-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .demo-header h2 {
    margin-bottom: 8px;
    font-size: 28px;
    font-weight: 600;
    color: #1a1a1a;
    letter-spacing: -0.01em;
  }

  .demo-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    align-items: start;
  }

  .task-tree-column {
    background: #fafafa;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    min-height: 400px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .controls-panel {
    display: flex;
    flex-direction: column;
  }

  .benefits-explanation {
    max-width: 520px;
    margin: 0 auto;
    padding: 0 0 0 0;
  }

  .benefits-explanation p {
    margin: 0;
    font-size: 16px;
    line-height: 1.6;
    color: #374151;
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .demo-layout {
      grid-template-columns: 1fr;
      gap: 32px;
    }

    .controls-panel {
      order: -1;
    }
  }
</style> 