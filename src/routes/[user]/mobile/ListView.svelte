<TodoList
  listTitle=""
  tasksToDisplay={$inclusiveWeekTodo}
  style="
    background-color: transparent;
    padding-top: var(--main-content-top-margin); 
    border-radius: 16px; 
    height: 2400px;
  "
  willShowCheckbox={false}
  isLargeFont={true}
  let:startTypingNewTask={startTypingNewTask}
>
  <slot {startTypingNewTask}>
  
  </slot>
</TodoList>

<script>
  import TodoList from '../components/ListsArea/TodoList.svelte'
  import { inclusiveWeekTodo } from '/src/lib/store'
</script>