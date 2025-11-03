<script>
  import { user } from '$lib/store'
  import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { onMount, onDestroy } from 'svelte'
  import ListenToDoc from '../components/Archive/ListenToDoc.svelte'
  import JournalEntries from '../components/Archive/JournalEntries.svelte'
  import BaseMenu from '$lib/components/BaseMenu.svelte'

  let routines = null
  let selectedRoutineID = ''
  let routineInstances = null
  let unsub

  $: if (selectedRoutineID) {
    listenToInstances()
  }

  $: if (routines) {
    starredWithIcons = routines.filter(r => r.isStarred && r.iconURL)
    unstarredWithIcons = routines.filter(r => !r.isStarred && r.iconURL)
    textRoutines = routines.filter(r => !r.iconURL)
  }

  let starredWithIcons = []
  let unstarredWithIcons = []
  let textRoutines = []

  onMount(async () => {
    listenToRoutines()
  })

  onDestroy(() => {
    if (unsub) unsub()
  })

  async function listenToRoutines() {
    const ref = collection(db, '/users/' + $user.uid + '/templates')
    onSnapshot(ref, (querySnapshot) => {
      const temp = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
      temp.sort((a, b) => {
        if (a.isStarred && !b.isStarred) return -1
        if (!a.isStarred && b.isStarred) return 1
        return (a.name || '').localeCompare(b.name || '')
      })
      routines = temp
    })
  }

  async function listenToInstances() {
    if (unsub) unsub()
    const ref = collection(db, '/users/' + $user.uid + '/tasks')
    const q = query(
      ref,
      where('templateID', '==', selectedRoutineID),
      orderBy('startDateISO', 'desc')
    )
    unsub = onSnapshot(q, (querySnapshot) => {
      const temp = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
      temp.sort((a, b) => new Date(b.startDateISO) - new Date(a.startDateISO))
      routineInstances = temp
    })
  }

  function selectHabit(routineID) {
    selectedRoutineID = routineID
  }
</script>

<div class="habits-view">
  {#if routines}
    <div class="habits-grid">
      {#each starredWithIcons as routine (routine.id)}
        <button 
          class="habit-item"
          class:selected={selectedRoutineID === routine.id}
          on:click={() => selectHabit(routine.id)}
        >
          <img src={routine.iconURL} alt={routine.name} class="habit-icon" title={routine.name} />
          <span class="star-icon material-icons">star</span>
        </button>
      {/each}
      
      {#if (unstarredWithIcons.length > 0 || textRoutines.length > 0)}
        <BaseMenu {activator} {content} />
      {/if}
    </div>
  {/if}

  {#snippet activator({ toggle })}
    <button 
      class="habit-item more-button"
      on:click={toggle}
    >
      <span class="material-symbols-outlined more-icon">more_horiz</span>
    </button>
  {/snippet}

  {#snippet content({ close })}
    <div class="more-menu-content">
      {#if unstarredWithIcons.length > 0}
        <div class="menu-section">
          {#each unstarredWithIcons as routine (routine.id)}
            <button 
              class="menu-item"
              class:selected={selectedRoutineID === routine.id}
              on:click={() => { selectHabit(routine.id); close(); }}
            >
              <img src={routine.iconURL} alt={routine.name} class="menu-icon" />
              <span class="menu-name">{routine.name}</span>
            </button>
          {/each}
        </div>
      {/if}
      
      {#if textRoutines.length > 0}
        {#if unstarredWithIcons.length > 0}
          <div class="menu-divider"></div>
        {/if}
        <div class="menu-section">
          {#each textRoutines as routine (routine.id)}
            <button 
              class="menu-item"
              class:selected={selectedRoutineID === routine.id}
              on:click={() => { selectHabit(routine.id); close(); }}
            >
              <div class="menu-icon-placeholder">
                <span class="material-symbols-outlined">task</span>
              </div>
              <span class="menu-name">{routine.name}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/snippet}

  {#if selectedRoutineID}
    <ListenToDoc docPath={'/users/' + $user.uid + '/templates/' + selectedRoutineID}
      let:theDoc={selectedRoutine}
    >
      {#if selectedRoutine}
        <JournalEntries 
          {selectedRoutine}
          {routineInstances}
        />
      {/if}
    </ListenToDoc>
  {:else}
    <div class="select-habit-prompt">
      <span class="material-symbols-outlined">info</span>
      <p>Select a habit to view its instances</p>
    </div>
  {/if}
</div>

<style>
  .habits-view {
    height: 100%;
  }

  .habits-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0;
    margin-bottom: 12px;
  }

  .habit-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    aspect-ratio: 1;
    padding: 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    position: relative;
    border-radius: 6px;
  }

  .habit-item:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  .habit-item.selected {
    background: rgba(0, 89, 125, 0.1);
  }

  .habit-item.selected::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 6px;
    pointer-events: none;
  }

  .habit-icon {
    width: 100%;
    height: 100%;
    max-width: 48px;
    max-height: 48px;
    object-fit: contain;
  }

  .star-icon {
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 10px;
    color: #ffd700;
    filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
    z-index: 1;
  }

  .select-habit-prompt {
    text-align: center;
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .select-habit-prompt .material-symbols-outlined {
    font-size: 48px;
    opacity: 0.5;
  }

  .more-button {
    background: rgba(0, 0, 0, 0.02);
  }

  .more-icon {
    font-size: 32px;
    color: #666;
  }

  .more-menu-content {
    padding: 8px;
    max-height: 60vh;
    overflow-y: auto;
    min-width: 200px;
  }

  .menu-section {
    display: flex;
    flex-direction: column;
  }

  .menu-divider {
    height: 1px;
    background: #e0e0e0;
    margin: 8px 0;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: none;
    background: transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
  }

  .menu-item:hover {
    background: #f5f5f5;
  }

  .menu-item.selected {
    background: rgba(0, 89, 125, 0.08);
  }

  .menu-icon {
    width: 32px;
    height: 32px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .menu-icon-placeholder {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .menu-icon-placeholder .material-symbols-outlined {
    font-size: 20px;
    color: #999;
  }

  .menu-name {
    font-size: 14px;
    color: #333;
    flex: 1;
  }
</style>

