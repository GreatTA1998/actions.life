<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import SimpleToggle from '$lib/components/SimpleToggle.svelte'
  import MslMoreVert from 'virtual:icons/material-symbols-light/more-vert'
  import MslInventory2Outline from 'virtual:icons/material-symbols-light/inventory-2-outline'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')

  let { 
    task,
    extraClass = '',
    fontSize = '1rem',
    color = 'var(--fine-control-color)'
  } = $props()
</script>

<PopoverMenu>
  {#snippet activator ({ id, anchorName })} 
    <!-- overflow-hidden is the quickfix for buttons causing overflow  -->
    <button 
      popovertarget={id} style:anchor-name={anchorName}
      style:width="calc(0.75 * {fontSize})"
      style:height={fontSize}
      style:color
      class="{extraClass} overflow-hidden justify-center" 
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
    <div class="flex flex-col items-start p-2 gap-y-2">
      <SimpleToggle
        checked={task.childrenLayout === 'timeline'}
        onchange={e => Task.update({ id: task.id, kvChanges: { childrenLayout: e.target.checked ? 'timeline' : 'normal' } })}
        label="Display subtasks as timeline"
      />

      <button onclick={() => Task.archiveTree(task) }
        class="text-left gap-x-[6px] text-neutral-600" 
      >
        <MslInventory2Outline style="font-size: 1.125rem"/>
        Archive from list
      </button>
    </div>
  {/snippet}
</PopoverMenu>