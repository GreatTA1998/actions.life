<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import ToggleGroup from '$lib/components/ToggleGroup.svelte'
  import MslMoreVert from 'virtual:icons/material-symbols-light/more-vert'
  import MslInventory2Outline from 'virtual:icons/material-symbols-light/inventory-2-outline'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')

  let { 
    task,
    extraClass = '',
    fontSize = '1rem'
  } = $props()
</script>

<PopoverMenu>
  {#snippet activator ({ id, anchorName })} 
    <!-- overflow-hidden is the quickfix for buttons causing overflow  -->
    <button 
      popovertarget={id} style:anchor-name={anchorName}
      style:width="calc(0.75 * {fontSize})"
      style:height={fontSize}
      class="{extraClass} overflow-hidden justify-center text-color-[var(--task-action-subtle-color)]" 
    >
      <div 
        style:font-size="calc(1.125 * {fontSize})"
        class="shrink-0 flex items-center"
      >
        <MslMoreVert/>  
      </div>
    </button>
  {/snippet}

  {#snippet content ()}
    <div style="padding: 8px; display: flex; flex-direction: column; row-gap: 8px;">    
      <ToggleGroup onselect={newVal => Task.update({ id: task.id, kvChanges: { childrenLayout: newVal }})}
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