<script>
  import TodoList from '/src/routes/[user]/components/ListsArea/TodoList.svelte'
  import ListenToListTrees from '/src/routes/[user]/components/ListsArea/ListenToListTrees.svelte'
  import { getContext, onMount, tick } from 'svelte'
  import { innerWidth } from 'svelte/reactivity/window'
  import { WIDTHS } from '$lib/utils/constants.js'

  const { logicAreaRect } = getContext('drag-drop')
  let { xyScrolling } = $props()

  const wrappingColumnLayout = `
    position: relative;
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

  const simpleMobileLayout = `
    position: relative;
    background-color: transparent; 
    padding-top: var(--main-content-top-margin);
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
        listWidth={xyScrolling ? WIDTHS.LIST : innerWidth.current}
        cssStyle={xyScrolling ? wrappingColumnLayout : simpleMobileLayout}
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