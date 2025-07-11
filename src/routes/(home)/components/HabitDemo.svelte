<script>
  import DoodleIcon from '../../../lib/components/DoodleIcon.svelte'
  import TaskProvider from '../../../lib/components/TaskProvider.svelte'
  import { DateTime } from 'luxon'
  import '../../../lib/styles/demo-shared.css'

  // Create mock dependencies for habit demo
  const mockTaskService = {
    update: ({ id, keyValueChanges }) => {
      console.log('Demo: Would update habit', id, 'with', keyValueChanges.isDone)
      updateHabitCompletion(id, keyValueChanges.isDone)
    }
  }

  function updateHabitCompletion(habitId, isDone) {
    const habitIndex = todayHabits.findIndex(h => h.id === habitId)
    if (habitIndex !== -1) {
      todayHabits[habitIndex].isDone = isDone
      // Update the featured habit if it matches
      if (featuredHabit.id === habitId) {
        featuredHabit.isDone = isDone
      }
      // Trigger reactivity
      todayHabits = [...todayHabits]
      featuredHabit = { ...featuredHabit }
    }
  }

  // Define habit types with real Firebase icons
  const habitTypes = [
    { id: 'run', name: 'Morning Run', iconURL: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2FEPtvgSIsPkpznSIffOoa.png?alt=media&token=018a960d-1f76-47eb-a0fe-85c6a5423bd9' },
    { id: 'stretch', name: 'Post-Run Stretch', iconURL: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2F6w6I9VRWZLRWqphuLgFz.png?alt=media&token=ba68dd3b-83fe-4ed2-bc38-9a2888d31f1b' },
    { id: 'hydrate', name: 'Hydration Check', iconURL: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2FhsCFkECSF4PcFt6MOcW0.png?alt=media&token=d4ed8987-9001-43bc-b48b-4f36caef6fb1' },
    { id: 'nutrition', name: 'Track Nutrition', iconURL: 'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/icons%2Fk49WsIjV1kQ2e6MW52BR.png?alt=media&token=0d44da5b-dfd7-4ff3-9971-3637b748c6be' }
  ]

  // Create today's habits - some completed, some not
  let todayHabits = habitTypes.map((habitType, index) => ({
    ...habitType,
    isDone: index < 2 // First two habits are completed for demo
  }))

  // Featured habit for the right panel (the hydration check)
  let featuredHabit = { ...todayHabits[2] } // Hydration habit

  const today = DateTime.now()
</script>

<div class="demo-section">
  <div class="demo-header">
    <h2>Double-click any habit icon</h2>
    <p class="demo-hint">to mark it as complete</p>
  </div>
  
  <div class="demo-layout">
    <!-- Left: Authentic day column -->
    <div class="day-column">
      <!-- Real DayHeader structure -->
      <div class="day-header">
        <div class="compact-horizontal">
          <div class="center-flex day-name-label active-day-name">
            {today.toFormat('ccc')}
          </div>
          <div class="center-flex date-number">
            <div class="center-flex active-date-number">
              {today.toFormat('dd')}
            </div>
          </div>
        </div>
      </div>

      <!-- Icon habits section -->
      <TaskProvider taskService={mockTaskService}>
        <div class="habits-area">
          <div class="icon-habits">
            {#each todayHabits as habit}
              <DoodleIcon iconTask={habit} size={36} />
            {/each}
          </div>
        </div>
      </TaskProvider>
    </div>

    <!-- Right: Interactive demo + explanation -->
    <div class="demo-panel">
      <div class="feature-explanation">
        <p>
          Many impactful habits take less than 1 minute, but clutter up the calendar when tracked
          <br><br>
          By drawing your own icons that you understand, you can fit 6 in the space of 1, so they're easy-to-understand.
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  .demo-section {
    max-width: 900px;
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
    grid-template-columns: 240px 1fr;
    gap: 56px;
    align-items: start;
  }

  .day-column {
    background: #fafafa;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }

  /* Real DayHeader styles */
  .day-header {
    width: 100%;
    padding: 20px 0 18px;
    background-color: #fafafa;
    border-bottom: 1px solid #e5e7eb;
  }

  .compact-horizontal {
    display: flex;
    justify-content: center;
  }

  .center-flex {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .day-name-label {
    font-size: 15px;
    margin-bottom: 0px;
    font-weight: 500;
    color: #6b7280;
  }

  .active-day-name {
    color: #1a1a1a;
  }

  .date-number {
    font-size: 16px;
    font-weight: 300;
  }

  .active-date-number {
    font-weight: 600;
    color: #1a1a1a;
    width: 28px;
    padding: 0px 0px;
  }

  .habits-area {
    padding: 20px;
    background: #fafafa;
  }

  .icon-habits {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
  }

  .demo-panel {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }

  .featured-demo {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 32px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border: 2px solid #e2e8f0;
    border-radius: 12px;
  }

  .demo-target {
    flex-shrink: 0;
  }



  .feature-explanation {
    max-width: 520px;
    margin: 0 auto;
    padding: 0 0 0 0;
  }

  .feature-explanation p {
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

    .day-column {
      max-width: 240px;
      margin: 0 auto;
    }

    .featured-demo {
      flex-direction: column;
      text-align: center;
      gap: 16px;
    }

    .demo-hint {
      order: -1;
      margin-bottom: 8px;
    }
  }
</style> 