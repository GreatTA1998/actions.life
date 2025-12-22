<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import ToggleGroup from '$lib/components/ToggleGroup.svelte'
  import Icon from '@iconify/svelte'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')

  let { taskObj } = $props()
</script>

<PopoverMenu 
  {activator} 
  {content} 
/>

{#snippet activator ({ setPosition, popovertarget })} 
  <div style="max-height: 16px; display: flex; align-items: center;">
    <button {popovertarget} onclick={setPosition} class="menu-icon flexbox content-center">
      <Icon icon="material-symbols-light:more-vert" style="font-size: 24px;"/>
    </button>
  </div>
{/snippet}

{#snippet content ({ close })} 
  <div style="padding: 8px; display: flex; flex-direction: column; row-gap: 8px;">    
    <ToggleGroup onselect={newVal => Task.update({ id: taskObj.id, keyValueChanges: { childrenLayout: newVal }})}
      options={[{ text: 'list', value: 'normal' }, { text: 'timeline', value: 'timeline' }]} 
      activeValue={taskObj.childrenLayout} 
    />

    <!-- <div class="menu-divider"></div> -->

    <button class="m-item" onclick={() => { Task.archiveTree({ id: taskObj.id }) }}>
      <Icon icon="material-symbols-light:inventory-2-outline" style="font-size: 18px;"/>
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