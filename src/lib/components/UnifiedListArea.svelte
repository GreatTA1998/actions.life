<script>
  import TodoList from '/src/routes/[user]/components/ListsArea/TodoList.svelte'
  import ListenToListTrees from '/src/routes/[user]/components/ListsArea/ListenToListTrees.svelte'
  import ListsArea from '/src/routes/[user]/components/ListsArea/ListsArea.svelte'
  import { getContext, onMount, tick } from 'svelte'
  import { trackWidth } from '$lib/utils/svelteActions.js'

  const { logicAreaRect } = getContext('drag-drop')

  let { xyScrolling } = $props()

  let listAreaHeight = $state(400) // to-do: fix this
  let listWidth = $state(0)

  onMount(async () => {
    await tick() // computed sizes from `style` CSS are not ready yet
    logicAreaRect.set(
      () => document.querySelector('#list-area').getBoundingClientRect()
    )
  })
</script>

<div id="list-area" class="h-full overflow-auto hide-scrollbar">
  {#if xyScrolling}
    <ListsArea/>
  {:else}
    <div class="list-container hide-scrollbar" 
      use:trackWidth={w => listWidth = w} 
      style="height: {listAreaHeight}px;"
    >    
      <ListenToListTrees>
        {#snippet children({ trees })}
          {#if listWidth}
            <TodoList {listWidth} isLargeFont {trees}
              cssStyle="
                position: relative;
                background-color: transparent; 
                padding-top: var(--main-content-top-margin);
              "
            />
          {/if}
        {/snippet}
      </ListenToListTrees>
    </div>
  {/if}
</div>

<style>
  #list-area {
    background-color: var(--todo-list-bg-color, #f5f5f5);
  }
</style>