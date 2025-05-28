<script>
  import PhotoGrid from './PhotoGrid.svelte'
  import JournalEntries from './JournalEntries.svelte'  
  import ListenToDoc from './ListenToDoc.svelte'
  import { user } from '/src/lib/store/userStore.js'
  import { onMount, onDestroy } from 'svelte'
  import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
  import { db } from '/src/lib/db/init'
  import { createEventDispatcher } from 'svelte'

  let sidebarOpen = true
  let routines = null
  let selectedRoutineID = ''
  let routineInstances = null
  let isViewingPhotos = true
  let unsub
  const dispatch = createEventDispatcher()

  $: if (selectedRoutineID) {
    listenToInstances()
  }

  onMount(async () => {
    listenToRoutines()
  })

  onDestroy(() => {
    if (unsub) unsub()
  })

  async function listenToRoutines () {
    const ref = collection(db, '/users/' + $user.uid + '/templates')

    onSnapshot(ref, (querySnapshot) => {
      const temp = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
      // Sort by starred first, then alphabetically by name
      temp.sort((a, b) => {
        if (a.isStarred && !b.isStarred) return -1
        if (!a.isStarred && b.isStarred) return 1
        return (a.name || '').localeCompare(b.name || '')
      })
      routines = temp
    })
  }

  async function listenToInstances () {
    if (unsub) unsub()

    const ref = collection(db, '/users/' + $user.uid + '/tasks')

    const q = query(ref, 
      where('templateID', '==', selectedRoutineID),
      orderBy('startDateISO', 'desc')
    )

    unsub = onSnapshot(q, (querySnapshot) => {
      const temp = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
      temp.sort((a, b) => new Date(b.startDateISO) - new Date(a.startDateISO))
      routineInstances = temp
    })
  }
</script>

<div class="container" class:sidebar-closed={!sidebarOpen}>
  <nav class="sidebar">
    <div class="nav-items">  
      <div style="border: none; font-size: 18px; font-weight: bold; padding: 8px 16px; margin-top: 16px; color: #333;">  
        Archive
      </div>
    </div>
    
    <div class="nav-items">  
      <div class="photo-nav-item"
        on:click={() => { 
          isViewingPhotos = true; selectedRoutineID = ''
        }}
        on:keydown
        class:selected-item={isViewingPhotos}
      >  
        <span class="material-symbols-outlined">photo_library</span>
        Photos
      </div>
      
      {#if routines}
        {#each routines as routine (routine.id)}
          <div 
            on:click={() => { 
              selectedRoutineID = routine.id; isViewingPhotos = false;
            }} 
            on:keydown
            class="nav-item" 
            class:selected-item={selectedRoutineID === routine.id}
          >
            {#if routine.iconURL}
              <img src={routine.iconURL} alt={routine.name} style="width: 16px; height: 16px;" />
            {:else}
              <div style="flex-basis: 16px; flex-shrink: 0; height: 16px; visibility: hidden;" alt="empty"></div>
            {/if}
            <span>{routine.name}</span>

            {#if routine.isStarred}
              <span class="star-icon material-icons">
                star
              </span>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  </nav>
  
  <main class="main-content">
    {#if isViewingPhotos && !selectedRoutineID}
      <PhotoGrid />
    {:else if selectedRoutineID}
      <ListenToDoc docPath={'/users/' + $user.uid + '/templates/' + selectedRoutineID}
        let:theDoc={selectedRoutine}
      >
        {#if selectedRoutine}
          <JournalEntries 
            {selectedRoutine}
            {routineInstances}
            on:task-click
          />
        {/if}
      </ListenToDoc>
    {/if}
  </main>
</div>

<style>
  .container {
    display: grid;
    grid-template-columns: 250px 1fr;
    height: 100%;
    transition: grid-template-columns 0.3s ease;
    overflow: hidden;
  }

  .sidebar-closed {
    grid-template-columns: 50px 1fr;
  }

  .sidebar {
    border-right: 1px solid #ddd;
    background-color: #f5f5f5;
    overflow-y: auto;
    height: 100%;
    display: grid;
  }

  .main-content {
    padding: 1rem;
    overflow-y: auto;
    height: 100%;
  }

  .photo-nav-item {
    border-bottom: 1px solid #ddd; margin-top: 24px; margin-bottom: 24px; padding: 4px 8px; display: flex; align-items: center; column-gap: 4px;
  }

  .nav-items {
    display: grid;
    min-width: 0;
  }

  .nav-item {
    padding: 4px 8px;
    background-color: #f5f5f5;
    border-bottom: 1px solid lightgrey;
    display: flex; 
    align-items: center;
    column-gap: 4px;
    min-width: 0;
    max-height: 40px;
    position: relative;
  }

  .nav-item > span:last-child {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .selected-item {
    background-color: #e0e0e0;
  }

  .star-icon {
    position: absolute;
    right: 8px;
    font-size: 14px;
    color: #ffd700;
  }
</style>