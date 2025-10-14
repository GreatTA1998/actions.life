<script>
  import BaseMenu from '$lib/components/BaseMenu.svelte'
  import ToggleGroup from '$lib/components/ToggleGroup.svelte'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')

  let { taskObj, onSubtaskAdd } = $props()
</script>

<BaseMenu 
  {activator} 
  {content} 
/>

{#snippet activator ({ toggle })} 
  <div style="max-height: 16px; display: flex; align-items: center;">
    <button onclick={toggle} class="material-symbols-outlined menu-icon" style="font-size: 24px;">
      more_vert
    </button>
  </div>
{/snippet}

{#snippet content ({ close })} 
  <div style="z-index: 1000; padding: 12px; display: flex; flex-direction: column; row-gap: 8px;">
    <button class="m-item" onclick={() => { console.log('clicked'); onSubtaskAdd(); close(); }}>
      <span class="material-symbols-outlined" style="font-size: 22px;">
        add
      </span>
      subtask
    </button>

    <div class="menu-divider"></div>
    
    <ToggleGroup onselect={newVal => Task.update({ id: taskObj.id, keyValueChanges: { childrenLayout: newVal }})}
      options={[{ text: 'normal', value: 'normal' }, { text: 'timeline', value: 'timeline' }]} 
      activeValue={taskObj.childrenLayout} 
    />

    <div class="menu-divider"></div>

    <button class="m-item" onclick={() => { Task.archiveTree({ id: taskObj.id }) }}>
      <span class="material-symbols-outlined" style="font-size: 18px;">
        inventory_2
      </span>
      Hide from list
    </button>
  </div>
{/snippet}

<style>
  .menu-icon {
    font-weight: 200;
    color: var(--task-action-subtle-color);
  }

  .m-item {
    text-align: left;
    font-size: 16px;
    font-weight: 400;
    color: rgb(80, 80, 80);
    display: flex;
    align-items: center;
    column-gap: 6px;
  }

  .menu-divider {
    height: 1px;
    background: #ececf0;
    margin: 4px 0;
    border: none;
  }
</style>