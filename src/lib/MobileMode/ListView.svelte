<GrandTreeTodoReusableList
  listTitle=""
  allTasksDue={$inclusiveWeekTodo}
  style="
    background-color: transparent;
    padding-top: var(--main-content-top-margin); 
    border-radius: 16px; 
    height: 2400px;
  "
  willShowCheckbox={false}
  isLargeFont={true}
  isRecursive={false}
  on:task-create
  on:task-unscheduled
  on:task-click
  on:task-dragged
  on:task-checkbox-change
  let:startTypingNewTask={startTypingNewTask}
>
  <slot {startTypingNewTask}>
  
  </slot>
</GrandTreeTodoReusableList>

<script>
  import GrandTreeTodoReusableList from '$lib/GrandTreeTodoReusableList.svelte'
  import { inclusiveWeekTodo } from '/src/store'
</script>