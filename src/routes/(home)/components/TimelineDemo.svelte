<script>
  import RecursiveTask from '../../[user]/components/TaskTree/RecursiveTask.svelte'
  import ToggleGroup from '../../../lib/components/ToggleGroup.svelte'
  import { getContext } from 'svelte'

  const { memoryTree, Task } = getContext('app')

  let taskObj = $derived.by(() => {
    for (const tree of $memoryTree) {
      if (tree.name === 'Walk the Camino de Santiago') {
        return tree
      }
    }
    return null
  })
</script>

<div class="demo-section">
  <div class="demo-header">
    <h2>Toggle between list / timeline</h2>
  </div>
  
  <div class="demo-layout">
    <div class="task-tree-column">
      <div style="width: 240px;">
        <ToggleGroup 
          options={[
            { text: 'list', value: 'normal' }, 
            { text: 'timeline', value: 'timeline' }
          ]} 
          activeValue={taskObj.childrenLayout}
          onselect={newVal => Task.update({ id: taskObj.id, keyValueChanges: { childrenLayout: newVal } })}
        />
      </div>

      <RecursiveTask 
        taskObj={taskObj}
        depth={0}
        ancestorRoomIDs={[]}
        isLargeFont={false}
      />
    </div>

    <div class="controls-panel">
      <div class="benefits-explanation">
        <p>
          Calendars use fixed timeframes: week, month, and year. But important things often span arbitrary timeframes.
          <br><br>
          Timelines display tasks based on temporal distance. They rewire us to think on longer time horizons.
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