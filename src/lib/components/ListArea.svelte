<script>
  import TodoList from '/src/routes/[user]/components/ListsArea/TodoList.svelte'
  import ListenToListTrees from '/src/routes/[user]/components/ListsArea/ListenToListTrees.svelte'
  import { getContext, onMount, tick } from 'svelte'

  const { logicAreaRect } = getContext('drag-drop')
  let { xyScrolling } = $props()

  const wrappingColumnLayout = `
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: start; /* default is stretch */
    align-content: start; /* prevents column gaps from widening when the area gets larger */
    column-gap: 24px; /* matches dropzone's height */
    padding: 0 24px; /* add same spacing on left/right sides to match column gap */
    height: 100%;
    min-width: max-content;
  `

  const simpleLayout = `
    height: 100%;
  `

  onMount(async () => {
    await tick() // computed sizes from `style` CSS are not ready yet
    logicAreaRect.set(
      () => document.querySelector('#list-area').getBoundingClientRect()
    )
  })
</script>

<div id="list-area" class="h-full relative overflow-auto hide-scrollbar">
  <ListenToListTrees>
    {#snippet children({ trees })}
      <TodoList {trees}
        listWidth={xyScrolling ? 'fit-content' : '100%'}
        style={xyScrolling ? wrappingColumnLayout : simpleLayout}
        isLargeFont={!xyScrolling}
      />       
    {/snippet}
  </ListenToListTrees>
</div>

<style>
  #list-area {
    background-color: var(--todo-list-bg-color);
  }
</style>