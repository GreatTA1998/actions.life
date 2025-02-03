<script>
  import PhotoGrid from './PhotoGrid.svelte'
  import JournalEntries from './JournalEntries.svelte'
  import { user } from '/src/store/userStore.js'
  import { getFirestoreCollection, getFirestoreQuery, createFirestoreQuery } from '/src/helpers/firestoreHelpers.js'
  import { formatDate } from '/src/helpers/everythingElse.js'
  import { onMount } from 'svelte'
  import { collection, query, where, orderBy } from 'firebase/firestore'
  import { db } from "/src/back-end/firestoreConnection"

  let sidebarOpen = true
  let routines = null
  let selectedRoutine =  null
  let routineInstances = null
  let photoTasks = null
  let isViewingPhotos = true

  $: if (selectedRoutine) {
    fetchRoutineInstances()
  }

  onMount(async () => {
    fetchRoutines()
  })

  async function fetchRoutines () {
    const temp = await getFirestoreCollection('/users/' + $user.uid + '/templates')
    routines = temp
  }

  async function fetchRoutineInstances () {
    const ref = collection(db, '/users/' + $user.uid + '/tasks')

    const q = query(ref, 
      where('templateID', '==', selectedRoutine.id),
      orderBy('startDateISO', 'desc')
    )
    const temp = await getFirestoreQuery(q)
    routineInstances = temp
  }
</script>

<div class="container" class:sidebar-closed={!sidebarOpen}>
  <nav class="sidebar">
    <!-- <button on:click={() => sidebarOpen = !sidebarOpen}>
      {sidebarOpen ? '←' : '→'}
    </button> -->

    <div class="nav-items">  
      <div 
        on:click={() => { 
          isViewingPhotos = true; selectedRoutine = null
        }}
        class:selected-item={isViewingPhotos}
        style="border-bottom: 1px solid #ddd; margin-top: 24px; margin-bottom: 24px; padding: 4px 8px; display: flex; align-items: center; column-gap: 4px;"
      >  
        <span class="material-symbols-outlined">photo_library</span>
        Photos
      </div>
      
      {#if routines}
        {#each routines as routine (routine.id)}
          <div on:click={() => { 
            selectedRoutine = routine; isViewingPhotos = false;
          }}
            class="nav-item" 
            class:selected-item={selectedRoutine?.id === routine.id}
          >
            {#if routine.iconURL}
              <img src={routine.iconURL} alt={routine.name} style="width: 16px; height: 16px;" />
            {:else}
              <img style="flex-basis: 16px; flex-shrink: 0; height: 16px; visibility: hidden;">
            {/if}
            <span>{routine.name}</span>
          </div>
        {/each}
      {/if}
    </div>
  </nav>
  
  <main class="main-content">
    <div style="opacity: 0.5; font-size: 14px;">
      Historical Archive
    </div>

    {#if isViewingPhotos && !selectedRoutine}
      <PhotoGrid 
        {photoTasks}
      />
    {:else if selectedRoutine}
      <JournalEntries 
        {selectedRoutine} 
        {routineInstances}
      />
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
</style>