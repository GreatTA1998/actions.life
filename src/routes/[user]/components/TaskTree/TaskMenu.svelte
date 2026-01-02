<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import ToggleGroup from '$lib/components/ToggleGroup.svelte'
  import MslMoreVert from 'virtual:icons/material-symbols-light/more-vert'
  import MslInventory2Outline from 'virtual:icons/material-symbols-light/inventory-2-outline'
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
      <MslMoreVert style="font-size: 1.5rem;"/>
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
      <MslInventory2Outline style="font-size: 1.125rem;"/>
      Archive from list
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
    font-size: 1rem;
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