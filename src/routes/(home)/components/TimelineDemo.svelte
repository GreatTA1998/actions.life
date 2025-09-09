<script>
  import RecursiveTask from '../../[user]/components/TaskTree/RecursiveTask.svelte'
  import ToggleGroup from '../../../lib/components/ToggleGroup.svelte'
  import { getContext } from 'svelte'

  const { memoryTree, Task } = getContext('app')

  $: taskObj = $memoryTree[4]
</script>

<div class="demo-section">
  <div class="demo-header">
    <h2>Press the timeline button</h2>
    <p class="demo-hint">to visualize time gaps between things</p>
  </div>
  
  <div class="demo-layout">
    <div class="task-tree-column">
      <div style="width: 240px;">
        <ToggleGroup 
          options={[
            { text: 'normal', value: 'normal' }, 
            { text: 'timeline', value: 'timeline' }
          ]} 
          activeValue={taskObj.childrenLayout}
          on:select={e => Task.update({ id: taskObj.id, keyValueChanges: { childrenLayout: e.detail.value } })}
        />
      </div>
      
      <RecursiveTask 
        taskObj={taskObj}
        depth={0}
        willShowCheckbox
        ancestorRoomIDs={[]}
        isLargeFont={false}
      />
    </div>

    <div class="controls-panel">
      <div class="benefits-explanation">
        <p>
          We exist in different timelines at the same time.
          <br><br>
          Calendars usually have rigid timeframes: week, month, year etc. But important things often span arbitrary timeframes.
          <br><br>
          Here, timelines are first-class constructs, so you can display task trees, timelines of different resolutions together.
          <br><br>
          Besides from keeping track of deadlines, timelines rewire us to think on longer time horizons.
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