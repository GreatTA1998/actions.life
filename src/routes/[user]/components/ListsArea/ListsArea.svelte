<script>
  import TodoList from './TodoList.svelte'

  const wrappingColumnLayout = `
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    height: calc(100vh - var(--height-navbar));
    align-items: start; /* default is stretch */
    align-content: start; /* prevents column gaps from widening when the area gets larger */
    column-gap: 24px; /* matches dropzone's height */
    padding: 0 24px; /* add same spacing on left/right sides to match column gap */
  `
</script>

<div class="todo-list-container"> 
  <TodoList 
    listWidth="320px"
    willShowCheckbox={true} 
    cssStyle={wrappingColumnLayout}
  />
</div>

<style>
  .todo-list-container {
    height: 100%;
    /* width: 100%; would cause the strange shifting out of screen bug*/
  }
</style>