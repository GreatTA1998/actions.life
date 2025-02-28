<div class="todo-container">
  <GrandTreeTodoReusableList
    listTitle="TO-DO"
    allTasksDue={$inclusiveWeekTodo}
    dueInHowManyDays={7}
    style="padding-top: var(--height-main-content-top-margin); background-color: var(--todo-list-bg-color); border-radius: 16px; outline: 0px solid red; height: 100%;"
    willShowCheckbox={false}
    on:new-root-task
    on:subtask-create
    on:task-click
    on:task-dragged
    on:task-checkbox-change
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