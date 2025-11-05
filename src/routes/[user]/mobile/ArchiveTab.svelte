<script>
  import { user, openTaskPopup, updateCache } from '$lib/store'
  import { collection, query, orderBy, limit, onSnapshot, where, getDocs } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { onMount, onDestroy } from 'svelte'

  let rootTasks = [] // Active root tasks (lists) for filtering
  let archivedTasks = [] // Archived tasks matching the selected rootID
  let selectedRootID = null // Selected rootID filter (null = all)
  let searching = false
  let snapshotCount = 0

  let rootTasksUnsub

  // Query for active root tasks (same as ListArea)
  onMount(() => {
    const tasksCollection = collection(db, `users/${$user.uid}/tasks`)
    const rootTasksQuery = query(
      tasksCollection,
      where('persistsOnList', '==', true),
      where('isArchived', '==', false)
    )
    
    rootTasksUnsub = onSnapshot(rootTasksQuery, (snapshot) => {
      // Filter for root tasks (parentID === '')
      rootTasks = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(task => task.parentID === '')
        .sort((a, b) => (b.orderValue || 0) - (a.orderValue || 0))
      
      // Auto-select first root if none selected
      if (!selectedRootID && rootTasks.length > 0) {
        selectedRootID = rootTasks[0].id
        performSearch()
      }
    })
  })

  onDestroy(() => {
    if (rootTasksUnsub) rootTasksUnsub()
  })

  async function performSearch() {
    if (!selectedRootID) {
      archivedTasks = []
      snapshotCount = 0
      return
    }

    searching = true
    try {
      const tasksCollection = collection(db, `users/${$user.uid}/tasks`)
      const q = query(
        tasksCollection,
        where('isArchived', '==', true),
        where('rootID', '==', selectedRootID),
        orderBy('orderValue', 'desc'),
        limit(100)
      )
      
      const snapshot = await getDocs(q)
      snapshotCount = snapshot.docs.length
      archivedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      updateCache(archivedTasks)
    } catch (err) {
      console.error('Error performing search:', err)
      archivedTasks = []
      snapshotCount = 0
    } finally {
      searching = false
    }
  }

  function selectRoot(rootID) {
    selectedRootID = rootID
    performSearch()
  }
</script>

<div class="archive-tab">
  <div class="filters-section">
    <h3 class="filters-title">Filter by List</h3>
    <div class="root-filters">
      {#each rootTasks as rootTask (rootTask.id)}
        <button
          class="root-filter-chip"
          class:active={selectedRootID === rootTask.id}
          onclick={() => selectRoot(rootTask.id)}
        >
          {rootTask.name || 'Untitled'}
        </button>
      {/each}
    </div>
  </div>

  <div class="results-section">
    <div class="results-count">
      {snapshotCount} archived {snapshotCount === 1 ? 'task' : 'tasks'}
      {#if selectedRootID}
        {#each rootTasks as rootTask (rootTask.id)}
          {#if rootTask.id === selectedRootID}
            in "{rootTask.name || 'Untitled'}"
          {/if}
        {/each}
      {/if}
    </div>

    {#if searching}
      <div class="loading">Searching...</div>
    {:else if archivedTasks.length === 0 && selectedRootID}
      <div class="no-results">No archived tasks found for this list.</div>
    {:else if !selectedRootID}
      <div class="no-results">Select a list to view archived tasks.</div>
    {:else}
      <div class="tasks-list">
        {#each archivedTasks as task (task.id)}
          <div
            class="task-item"
            role="button"
            tabindex="0"
            onclick={() => openTaskPopup(task)}
            onkeydown={(e) => e.key === 'Enter' && openTaskPopup(task)}
          >
            <div class="task-name">{task.name || 'Untitled'}</div>
            {#if task.orderValue !== undefined}
              <div class="task-order">Order: {task.orderValue}</div>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .archive-tab {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }

  .filters-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .filters-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }

  .root-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .root-filter-chip {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 16px;
    background: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
    color: #555;
  }

  .root-filter-chip:hover {
    border-color: #bbb;
    background: #f9f9f9;
  }

  .root-filter-chip.active {
    background: var(--logo-twig-color, #b34f1b);
    border-color: var(--logo-twig-color, #b34f1b);
    color: white;
  }

  .results-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .results-count {
    font-size: 12px;
    color: #666;
  }

  .loading {
    padding: 16px;
    text-align: center;
    color: #666;
    font-size: 14px;
  }

  .no-results {
    padding: 16px;
    text-align: center;
    color: #777;
    font-size: 13px;
  }

  .tasks-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .task-item {
    padding: 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease;
  }

  .task-item:hover {
    border-color: #bbb;
    background: #f9f9f9;
  }

  .task-item:focus-visible {
    outline: 2px solid var(--logo-twig-color, #b34f1b);
    outline-offset: 2px;
  }

  .task-name {
    font-size: 14px;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
  }

  .task-order {
    font-size: 12px;
    color: #777;
  }
</style>

