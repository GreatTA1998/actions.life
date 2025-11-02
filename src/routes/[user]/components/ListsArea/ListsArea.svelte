<script>
  import TodoList from './TodoList.svelte'

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
</script>

<TodoList 
  listWidth="320px"
  cssStyle={wrappingColumnLayout}
/>