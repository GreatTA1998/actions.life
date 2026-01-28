<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import ToggleGroup from '$lib/components/ToggleGroup.svelte'
  import MslMoreVert from 'virtual:icons/material-symbols-light/more-vert'
  import MslInventory2Outline from 'virtual:icons/material-symbols-light/inventory-2-outline'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')

  let { task } = $props()
</script>

<PopoverMenu>
  {#snippet activator ({ id, anchorName })} 
    <div style="anchor-name: {anchorName}; max-height: 16px; display: flex; align-items: center;">
      <button popovertarget={id} class="menu-icon flexbox items-center">
        <MslMoreVert style="font-size: 1.5rem;"/>
      </button>
    </div>
  {/snippet}

  {#snippet content ()}
    <div style="padding: 8px; display: flex; flex-direction: column; row-gap: 8px;">    
      <ToggleGroup onselect={newVal => Task.update({ id: task.id, keyValueChanges: { childrenLayout: newVal }})}
        options={[{ text: 'list', value: 'normal' }, { text: 'timeline', value: 'timeline' }]} 
        activeValue={task.childrenLayout} 
      />

      <button class="m-item" onclick={() => { Task.archiveTree({ id: task.id }) }}>
        <MslInventory2Outline style="font-size: 1.125rem;"/>
        Archive
      </button>
    </div>
  {/snippet}
</PopoverMenu>

<style>
  .menu-icon {
    font-weight: 200;
    color: var(--task-action-subtle-color);
  }

  .m-item {
    text-align: left;
    font-size: 1rem;
    font-weight: 400;
    color: rgb(80, 80, 80);
    display: flex;
    align-items: center;
    column-gap: 6px;
  }
</style>