<script>
  import BaseMenu from '$lib/components/BaseMenu.svelte'
  import ToggleGroup from '$lib/components/ToggleGroup.svelte'
  import Task from '$lib/db/models/Task.js'
  import { createEventDispatcher } from 'svelte'

  export let taskObj

  const dispatch = createEventDispatcher()
</script>

<BaseMenu let:toggle={toggle} let:close={close}>
  <div style="line-height: 0; max-height: 16px; overflow: visible; display: flex; align-items: center;">
    <button on:click={toggle} class="material-symbols-outlined menu-icon" style="font-size: 24px;">
      more_vert
    </button>
  </div>

  <div slot="content" style="padding: 12px; display: flex; flex-direction: column; row-gap: 8px;">
    <button class="m-item" on:click={() => { dispatch('subtask-add'); close(); }}>
      <span class="material-symbols-outlined" style="font-size: 22px;">
        add
      </span>
      subtask
    </button>

    <div class="menu-divider"></div>

    <ToggleGroup on:select={e => Task.update({ id: taskObj.id, keyValueChanges: { childrenLayout: e.detail.value }})}
      options={[{ text: 'normal', value: 'normal' }, { text: 'timeline', value: 'timeline' }]} 
      activeValue={taskObj.childrenLayout} 
    />

    <button class="m-item" on:click={() => { 
      Task.update({ 
        id: taskObj.id, 
        keyValueChanges: { isCollapsed: !taskObj.isCollapsed }
      }); 
      close(); 
    }}>
      <span class="material-symbols-outlined" style="font-size: 22px;">
        {taskObj.isCollapsed ? 'expand_more' : 'expand_less'}
      </span>
      {taskObj.isCollapsed ? 'Expand' : 'Collapse'}
    </button>

    <div class="menu-divider"></div>

    <button class="m-item" on:click={() => { Task.archiveTree({ id: taskObj.id }) }}>
      <span class="material-symbols-outlined" style="font-size: 22px;">
        inventory_2
      </span>
      Archive
    </button>
  </div>
</BaseMenu>

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
    margin: 8px 0;
    border: none;
  }
</style>