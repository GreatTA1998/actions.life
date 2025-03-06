<script>
  import TodoList from '$lib/ListsArea/TodoList.svelte'
  import { listenToListsAndTasks, listTreesMap, lists } from '/src/store/listAreaDataManager.js'
  import { createTaskNode, updateTaskNode } from '/src/helpers/crud.js'
  import { user } from '/src/store'
  import { onMount } from 'svelte'

  onMount(() => {
    listenToListsAndTasks($user.uid)
  })

  function handleNewTask (event, listId) {
    const { id, newTaskObj } = event.detail
    newTaskObj.listID = listId
    newTaskObj.persistsOnList = true
    newTaskObj.isArchived = false
    createTaskNode({ id, newTaskObj })
  }
</script>

{#if $lists}
  <div class="list-area lists">
    {#each $lists as list (list.id)}
      <TodoList
        listID={list.id}
        listTitle={list.name}
        tasksToDisplay={$listTreesMap[list.id]}
        willShowCheckbox={true}
        on:task-create={e => handleNewTask(e, list.id)}
        on:task-click
        on:task-update={e => updateTaskNode(e.detail)}
      />
    {/each}
  </div>
{/if}

<style>
  .list-area {
    width: 100%;
    max-width: 100%;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .lists {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
</style>