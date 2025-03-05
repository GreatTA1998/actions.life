<script>
  import { onMount } from 'svelte'
  import { user } from '/src/store'
  import { listenToListsAndTasks, listTreesMap, lists } from '/src/store/listAreaDataManager.js'
  import GrandTreeTodoReusableList from '$lib/GrandTreeTodoReusableList.svelte'
  import { createTaskNode } from '/src/helpers/crud.js'

  onMount(() => {
    listenToListsAndTasks($user.uid)
  })

  function handleNewRootTask (event, listId) {
    const { id, newTaskObj } = event.detail
    newTaskObj.listID = listId
    newTaskObj.persistsOnList = true
    newTaskObj.isArchived = false
    createTaskNode({ id, newTaskObj })
  }

  // TO-DO:
  // - add sub-tasks
  // - add quick tasks
</script>

{#if $lists}
  <div class="list-area">
    {#if $lists.length > 0}
      <div class="lists">
        {#each $lists as list (list.id)}
          <div class="list">
            <GrandTreeTodoReusableList
              listTitle={list.name}
              allTasksDue={$listTreesMap[list.id]}
              dueInHowManyDays={7}
              willShowCheckbox={true}
              on:new-root-task={(e) => handleNewRootTask(e, list.id)}
              on:subtask-create
              on:task-click
              on:task-checkbox-change
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
  
  .loading {
    text-align: center;
    padding: 2rem;
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