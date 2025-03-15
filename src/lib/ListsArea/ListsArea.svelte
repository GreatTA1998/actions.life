<script>
  import TodoList from '$lib/ListsArea/TodoList.svelte'
  import { listenToListsAndTasks, listTreesMap, lists } from '/src/store/services/listAreaDataManager.js'
  import { user } from '/src/store'
  import { onMount } from 'svelte'
  import { doc, updateDoc } from 'firebase/firestore'
  import { db } from '../../back-end/firestoreConnection'

  export let listID = null;

  let editingListId = null;
  let editingListName = ''

  onMount(() => {
    listenToListsAndTasks($user.uid)
  })

  // Filter lists based on listID if provided
  $: filteredLists = listID ? $lists.filter(list => list.id === listID) : $lists;

  // Start editing a list name
  function startEditingListName(list) {
    editingListId = list.id;
    editingListName = list.name;
  }

  // Save the edited list name
  async function saveListName(listId) {
    if (editingListName.trim() === '') return;
    
    try {
      const listRef = doc(db, "users", $user.uid, "lists", listId);
      await updateDoc(listRef, { name: editingListName });
      
      // Reset editing state
      editingListId = null;
      editingListName = '';
    } catch (error) {
      console.error("Error updating list name:", error);
    }
  }

  // Handle key press in the edit input
  function handleKeyPress(event, listId) {
    if (event.key === 'Enter') {
      saveListName(listId);
    } else if (event.key === 'Escape') {
      editingListId = null;
      editingListName = '';
    }
  }
</script>

{#if $lists}
  <div class="list-area lists">
    {#each filteredLists as list (list.id)}
      <div class="list-container">
        <div class="list-header">
          {#if editingListId === list.id}
            <input 
              type="text" 
              bind:value={editingListName} 
              on:blur={() => saveListName(list.id)}
              on:keydown={(e) => handleKeyPress(e, list.id)}
              class="list-name-input"
              autofocus
            />
          {:else}
            <h3 class="list-title" on:dblclick={() => startEditingListName(list)}>
              {list.name}
            </h3>
            <button class="edit-button" on:click={() => startEditingListName(list)}>
              ✎
            </button>
          {/if}
        </div>
        <TodoList
          listID={list.id}
          listTitle={list.name}
          tasksToDisplay={$listTreesMap[list.id]}
          willShowCheckbox={true}
          hideListTitle={true}
          on:dragstart
          on:dragend
          on:dragover
          on:drop
        />
      </div>
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

  .list-container {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .list-header {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: #f5f5f5;
    border-bottom: 1px solid #eee;
  }

  .list-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
    flex-grow: 1;
    cursor: pointer;
  }

  .edit-button {
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.2s;
  }

  .edit-button:hover {
    opacity: 1;
  }

  .list-name-input {
    width: 100%;
    padding: 0.3rem 0.5rem;
    font-size: 1.1rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
</style>