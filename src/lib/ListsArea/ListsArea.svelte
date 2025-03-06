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
  <div class="list-area">
    {#if $lists.length > 0}
      <div class="lists">
        {#each $lists as list (list.id)}
          <div class="list">
            <TodoList
              listID={list.id}
              listTitle={list.name}
              tasksToDisplay={$listTreesMap[list.id]}
              willShowCheckbox={true}
              on:task-create={e => handleNewTask(e, list.id)}
              on:task-click
              on:task-update={e => updateTaskNode(e.detail)}
            />
          </div>
        {/each}
      </div>
    {:else if Object.keys($listTreesMap).length === 0}
      <div class="empty-state">
        <p>No tasks found. Create your first task to get started!</p>
      </div>
    {/if}
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
  
  .list {
    border: 1px solid #eee;
    border-radius: 8px;
    padding: 0.5rem;
    background: white;
    height: 400px;
    overflow: auto;
  }
  
  .empty-state {
    color: #888;
    font-style: italic;
    text-align: center;
    padding: 2rem;
  }
</style>