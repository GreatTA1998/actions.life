<script>
  import TodoList from './TodoList.svelte'
  import ListenToListTrees from './ListenToListTrees.svelte'
  import { WIDTHS } from '$lib/utils/constants.js'

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
</script>

<ListenToListTrees>
  {#snippet children({ trees })}
    <TodoList 
      listWidth={WIDTHS.LIST}
      cssStyle={wrappingColumnLayout}
      {trees}
    />
  {/snippet}
</ListenToListTrees>
