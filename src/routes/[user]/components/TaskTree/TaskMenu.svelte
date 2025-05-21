<script>
  import BaseMenu from '$lib/components/BaseMenu.svelte'
  import Task from '$lib/db/models/Task.js'
  import { createEventDispatcher } from 'svelte'

  export let taskObj
  export let isLargeFont = false  

  const dispatch = createEventDispatcher()
</script>

<BaseMenu let:toggle={toggle} let:close={close}>
  <div on:click={toggle} on:keydown class="new-task-icon" style="font-size: {isLargeFont ? '48px' : ''}">
    <span class="material-symbols-outlined" style="font-weight: 200;">more_vert</span>
  </div>

  <div slot="content" style="padding: 12px; display: flex; flex-direction: column; row-gap: 8px;">
    <button class="m-item" on:click={() => { dispatch('subtask-add'); close(); }}>
      <span class="material-symbols-outlined" style="font-size: 22px;">
        add
      </span>
      subtask
    </button>

    <div class="menu-divider"></div>

    <div class="toggle-group">
      <button
        class="toggle-btn"
        class:active={taskObj.childrenLayout === 'normal'}
        on:click={() => { Task.update({ id: taskObj.id, keyValueChanges: { childrenLayout: 'normal' } }) }}
      >Normal</button>
      <button
        class="toggle-btn"
        class:active={taskObj.childrenLayout === 'timeline'}
        on:click={() => { Task.update({ id: taskObj.id, keyValueChanges: { childrenLayout: 'timeline' } }) }}
      >Timeline</button>
    </div>

    <button class="m-item" disabled style="opacity: 0.5;">
      <span class="material-symbols-outlined" style="font-size: 22px;">
        expand_less
      </span>
      Collapse (coming soon)
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
  .m-item {
    text-align: left;
    font-size: 16px;
    font-weight: 400;
    color: rgb(80, 80, 80);
    display: flex;
    align-items: center;
    column-gap: 6px;
  }

  .toggle-group {
    display: flex;
    background: #f6f6f7;
    border-radius: 6px;
    padding: 2px;
    gap: 0;
    margin: 4px 0;
  }

  .toggle-btn {
    flex: 1;
    padding: 6px 0;
    border: none;
    background: transparent;
    color: #6e6e7a;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 400;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .toggle-btn.active {
    background: #e3e6ee;
    color: #1a1a1a;
    font-weight: 500;
  }

  .toggle-btn:not(.active):hover {
    background: #ececf0;
    color: #444;
  }

  .menu-divider {
    height: 1px;
    background: #ececf0;
    margin: 8px 0;
    border: none;
  }
</style>