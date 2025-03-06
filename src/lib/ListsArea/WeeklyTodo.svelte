<div class="todo-container">
  <TodoList
    listTitle="TO-DO"
    tasksToDisplay={$inclusiveWeekTodo}
    style="padding-top: var(--height-main-content-top-margin); background-color: var(--todo-list-bg-color); border-radius: 16px; outline: 0px solid red; height: 100%;"
    willShowCheckbox={false}
    on:task-click
    on:task-create
    on:task-update
  />
</div>

<script>
  import TodoList from '$lib/ListsArea/TodoList.svelte'
  import { inclusiveWeekTodo } from '/src/store'
</script>

<style>
  .todo-container {
    min-width: 360px;
    background-color: var(--todo-list-bg-color);
    font-size: 2em;
    overflow-y: auto;
  }
</style>