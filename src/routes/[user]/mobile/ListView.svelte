<script>
  import TodoList from '../components/ListsArea/TodoList.svelte'
</script>

<div class="list-view-container">
  <TodoList
    style="
      background-color: transparent;
      padding-top: var(--main-content-top-margin); 
    "
    willShowCheckbox={false}
    isLargeFont={true}
    let:startTypingNewTask={startTypingNewTask}
  >
    <slot {startTypingNewTask}>
    
    </slot>
  </TodoList>
</div>

<style>
  .list-view-container {
    height: 100%;
    width: 100%;
    position: relative;
  }
</style>
