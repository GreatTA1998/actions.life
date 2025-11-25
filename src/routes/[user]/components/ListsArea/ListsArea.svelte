<script>
  import TodoList from './TodoList.svelte'
  import ListenToListTrees from './ListenToListTrees.svelte'

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
      listWidth={320}
      cssStyle={wrappingColumnLayout}
      {trees}
    />
  {/snippet}
</ListenToListTrees>
