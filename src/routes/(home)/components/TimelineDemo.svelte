<script>
  import ToggleGroup from '$lib/components/ToggleGroup.svelte'
  import TodoList from '../../[user]/components/ListsArea/TodoList.svelte'
  import { isMobile } from '$lib/utils/core.js'
  import { WIDTHS } from '$lib/utils/constants.js'
  import { getContext } from 'svelte'

  const { memoryTree, Task } = getContext('app')
  
  let task = $derived.by(() => {
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
    <div>
      <div style="width: 240px;">
        <ToggleGroup
          options={[
            { text: 'list', value: 'normal' }, 
            { text: 'timeline', value: 'timeline' }
          ]} 
          activeValue={task.childrenLayout}
          onselect={newVal => Task.update({ id: task.id, kvChanges: { childrenLayout: newVal } })}
        />
      </div>

      <TodoList trees={[task]}
        isLargeFont={isMobile()}
        listWidth={WIDTHS.LIST}
        cssStyle=""
      />
    </div>

    <div class="controls-panel">
      <div class="max-w-[520px] mx-auto">
        <p class="font-base text-gray-700">
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