<script>
  import { user, openTaskPopup, updateCache } from '$lib/store'
  import { collection, query, orderBy, limit, onSnapshot, where, getDocs } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { onMount, onDestroy } from 'svelte'

  let rootTasks = [] // Active root tasks (lists) for filtering
  let archivedTasks = [] // Displayed tasks (either search results or default view)
  let searchIndex = [] // Full list of archived tasks (lazy loaded)
  let searchIndexLoaded = false
  let selectedRootID = null // Selected rootID filter (null = all)
  let searching = false
  let loadingIndex = false
  let searchQuery = ''
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
    })

    // Load default view
    performDefaultFetch()
  })

  onDestroy(() => {
    if (rootTasksUnsub) rootTasksUnsub()
  })

  // --- 1. Default View (Latest 100) ---
  async function performDefaultFetch() {
    if (searchQuery.trim().length > 0) return // Don't override search
    
    searching = true
    try {
      const tasksCollection = collection(db, `users/${$user.uid}/tasks`)
      
      let q
      if (selectedRootID) {
        q = query(
          tasksCollection,
          where('isArchived', '==', true),
          where('parentID', '==', selectedRootID),
          orderBy('startDateISO', 'desc'),
          orderBy('startTime', 'desc'),
          orderBy('orderValue', 'desc'),
          limit(100)
        )
      } else {
        q = query(
          tasksCollection,
          where('isArchived', '==', true),
          where('parentID', '==', ''),
          orderBy('startDateISO', 'desc'),
          orderBy('startTime', 'desc'),
          orderBy('orderValue', 'desc'),
          limit(100)
        )
      }
      
      const snapshot = await getDocs(q)
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      // Only update if we are still in "default mode" (search query is empty)
      if (searchQuery.trim() === '') {
        archivedTasks = tasks
        snapshotCount = tasks.length
        updateCache(tasks)
      }
    } catch (err) {
      console.error('Error performing default fetch:', err)
      if (searchQuery.trim() === '') {
        archivedTasks = []
        snapshotCount = 0
      }
    } finally {
      if (searchQuery.trim() === '') {
        searching = false
      }
    }
  }

  // --- 2. Search Logic (Client-side Index) ---
  async function handleSearchInput() {
    const queryStr = searchQuery.toLowerCase().trim()
    
    if (queryStr === '') {
      // Revert to default view
      performDefaultFetch()
      return
    }

    if (!searchIndexLoaded) {
      await loadSearchIndex()
    }

    // Filter local index
    searching = true // Show loader briefly if needed (usually instant)
    
    let results = searchIndex.filter(t => (t.name || '').toLowerCase().includes(queryStr))
    
    // Optional: Apply root filter to search results too
    if (selectedRootID) {
      results = results.filter(t => t.parentID === selectedRootID)
    }

    // Sort by date desc (best effort if date exists in index, otherwise default)
    results.sort((a, b) => {
        const dateA = a.startDateISO || ''
        const dateB = b.startDateISO || ''
        return dateB.localeCompare(dateA)
    })

    archivedTasks = results.slice(0, 100) // Limit display to avoid DOM overload
    snapshotCount = results.length
    searching = false
  }

  async function loadSearchIndex() {
    if (loadingIndex || searchIndexLoaded) return
    loadingIndex = true
    
    try {
      // Pareto optimization: Fetch ALL archived tasks once
      // We can't use 'select' fields in client SDK, but we fetch everything.
      const tasksCollection = collection(db, `users/${$user.uid}/tasks`)
      const q = query(
        tasksCollection,
        where('isArchived', '==', true)
        // No limit here - we want the full index
      )
      
      const snapshot = await getDocs(q)
      searchIndex = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      searchIndexLoaded = true
      updateCache(searchIndex)
    } catch (err) {
      console.error('Error loading search index:', err)
    } finally {
      loadingIndex = false
    }
  }

  function selectRoot(rootID) {
    if (selectedRootID === rootID) {
      selectedRootID = null
    } else {
      selectedRootID = rootID
    }
    
    if (searchQuery.trim().length > 0) {
      handleSearchInput() // Re-filter search results
    } else {
      performDefaultFetch() // Re-fetch default view
    }
  }
</script>

<div class="archive-tab">
  <div class="fixed-section">
    <div class="search-bar-container">
      <div class="search-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </div>
      <input 
        type="text" 
        bind:value={searchQuery} 
        oninput={handleSearchInput}
        placeholder="Search archived tasks..." 
        class="search-input"
      />
      {#if loadingIndex}
        <div class="mini-loader"></div>
      {/if}
    </div>

    <div class="filters-section">
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
    {:else if archivedTasks.length === 0}
      <div class="no-results">No archived tasks found.</div>
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
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .archive-tab {
    height: 100%;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }

  .fixed-section {
    flex-shrink: 0;
    padding: 16px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .search-bar-container {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f5f5f5;
    border-radius: 10px;
    padding: 10px 12px;
  }

  .search-icon {
    color: #999;
    display: flex;
    align-items: center;
  }

  .search-input {
    border: none;
    background: transparent;
    outline: none;
    font-size: var(--font-size-lg);
    width: 100%;
    color: #333;
  }

  .search-input::placeholder {
    color: #aaa;
  }

  .mini-loader {
    width: 16px;
    height: 16px;
    border: 2px solid #ddd;
    border-top-color: #666;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .filters-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
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
    font-size: var(--font-size-md);
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
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    min-height: 0;
    padding: 0 16px 16px 16px;
    box-sizing: border-box;
  }

  .results-count {
    font-size: var(--font-size-sm);
    color: #888;
    margin-bottom: 8px;
  }

  .loading {
    padding: 32px;
    text-align: center;
    color: #999;
    font-size: var(--font-size-md);
  }

  .no-results {
    padding: 40px 16px;
    text-align: center;
    color: #999;
    font-size: var(--font-size-md);
    background: #fafafa;
    border-radius: 8px;
  }

  .tasks-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 12px;
  }

  .task-item {
    padding: 12px;
    background: transparent; /* Transparent background */
    cursor: pointer;
    transition: background 0.15s ease;
    display: flex;
    align-items: center;
    border-radius: 8px;
    border: 1px solid transparent; /* Placeholder to avoid jump */
  }

  .task-item:hover {
    background: rgba(0, 0, 0, 0.03); /* Subtle hover state */
  }

  .task-item:focus-visible {
    outline: 2px solid var(--logo-twig-color, #b34f1b);
    outline-offset: 2px;
    background: rgba(0, 0, 0, 0.03);
  }

  .task-name {
    font-size: var(--font-size-base);
    font-weight: 400;
    color: #222;
    line-height: 1.4;
  }
</style>

