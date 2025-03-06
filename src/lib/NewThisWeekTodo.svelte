<div class="todo-container">
  <GrandTreeTodoReusableList
    listTitle="TO-DO"
    tasksToDisplay={$inclusiveWeekTodo}
    style="padding-top: var(--height-main-content-top-margin); background-color: var(--todo-list-bg-color); border-radius: 16px; outline: 0px solid red; height: 100%;"
    willShowCheckbox={false}
    on:task-create
    on:task-click
    on:task-update
    on:task-dragged
  />
</div>

<script>
  import GrandTreeTodoReusableList from '$lib/GrandTreeTodoReusableList.svelte'
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