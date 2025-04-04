<script>
  import TodoList from '../components/ListsArea/TodoList.svelte'
</script>

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
