<script>
  import { user } from '$lib/store'
  import { collection, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { onMount } from 'svelte'
  import ListenToDoc from '../components/Archive/ListenToDoc.svelte'
  import ListenToRoutineInstances from '../components/Archive/ListenToRoutineInstances.svelte'
  import JournalEntries from '../components/Archive/JournalEntries.svelte'
  import BaseMenu from '$lib/components/BaseMenu.svelte'
  import Template from '$lib/db/models/Template.js'
  import { openTemplateEditor } from '../components/Templates/store.js'
  import TemplatePopup from '../components/Templates/components/TemplatePopup/TemplatePopup.svelte'

  function formatTime(minutes) {
    if (minutes < 60) return `${Math.round(minutes)} mins`
    const hours = Math.round(minutes / 60)
    return `${hours} hrs`
  }

  let routines = $state(null)
  let selectedRoutineID = $state('')
  let routineStats = $state(new Map())
  let maxMinutesSpent = $state(0)
  let fetchedStats = new Set() // Track which routines we've fetched stats for

  // Fetch stats for starred routines only once when routines load
  async function fetchStarredStats(routines) {
    const starredWithIcons = routines.filter(r => r.isStarred && r.iconURL)
    let maxTime = 0
    
    // Only fetch stats for routines we haven't fetched yet
    const toFetch = starredWithIcons.filter(r => !fetchedStats.has(r.id))
    
    if (toFetch.length === 0) return
    
    const statsPromises = toFetch.map(routine => 
      Template.getTotalStats({ id: routine.id })
        .then(stats => {
          fetchedStats.add(routine.id)
          maxTime = Math.max(maxTime, stats.minutesSpent || 0)
          return { id: routine.id, stats }
        })
        .catch(() => {
          fetchedStats.add(routine.id)
          return { id: routine.id, stats: { minutesSpent: 0, timesCompleted: 0 } }
        })
    )
    
    const results = await Promise.all(statsPromises)
    results.forEach(({ id, stats }) => {
      routineStats.set(id, stats)
    })
    
    // Update max time including existing stats
    routineStats.forEach((stats) => {
      maxTime = Math.max(maxTime, stats.minutesSpent || 0)
    })
    
    maxMinutesSpent = maxTime
    routineStats = new Map(routineStats) // trigger reactivity
  }

  let starredWithIcons = $derived.by(() => {
    if (!routines) return []
    const starred = routines.filter(r => r.isStarred && r.iconURL)
    
    // Sort by time spent (descending)
    return [...starred].sort((a, b) => {
      const statsA = routineStats.get(a.id) || { minutesSpent: 0 }
      const statsB = routineStats.get(b.id) || { minutesSpent: 0 }
      return statsB.minutesSpent - statsA.minutesSpent
    })
  })

  let unstarredWithIcons = $derived.by(() => {
    if (!routines) return []
    return routines.filter(r => !r.isStarred && r.iconURL)
  })

  let textRoutines = $derived.by(() => {
    if (!routines) return []
    return routines.filter(r => !r.iconURL)
  })

  onMount(async () => {
    listenToRoutines()
  })

  async function listenToRoutines() {
    const ref = collection(db, '/users/' + $user.uid + '/templates')
    onSnapshot(ref, async (querySnapshot) => {
      const temp = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
      temp.sort((a, b) => {
        if (a.isStarred && !b.isStarred) return -1
        if (!a.isStarred && b.isStarred) return 1
        return (a.name || '').localeCompare(b.name || '')
      })
      routines = temp
      
      // Fetch stats for starred routines
      await fetchStarredStats(routines)
    })
  }

  function selectHabit(routineID) {
    if (selectedRoutineID === routineID) {
      openTemplateEditor(routineID)
    } else {
      selectedRoutineID = routineID
    }
  }

  function getBarWidth(minutes) {
    if (!maxMinutesSpent || !minutes) return 0
    return (minutes / maxMinutesSpent) * 100 // 100% of available space for row layout
  }
</script>

<div class="habits-view">
  {#if routines}
    {#if starredWithIcons.length > 0}
      <!-- First 3 routines with bars -->
      <div class="starred-routines-list">
        {#each starredWithIcons.slice(0, 3) as routine (routine.id)}
          <button 
            class="starred-routine-row"
            onclick={() => selectHabit(routine.id)}
          >
            <div 
              class="routine-icon-wrapper"
              class:selected={selectedRoutineID === routine.id}
            >
              <img 
                src={routine.iconURL} 
                alt={routine.name} 
                class="routine-icon" 
                title={routine.name}
              />
            </div>
            <div class="routine-bar-container">
              {#if routineStats.has(routine.id)}
                {@const stats = routineStats.get(routine.id)}
                <div class="routine-bar" style="width: {getBarWidth(stats.minutesSpent)}%"></div>
              {/if}
            </div>
          </button>
        {/each}
      </div>
      
      <!-- Remaining routines in compact grid -->
      {#if starredWithIcons.length > 3 || unstarredWithIcons.length > 0 || textRoutines.length > 0}
        <div class="starred-routines-grid">
          {#if starredWithIcons.length > 3}
            {#each starredWithIcons.slice(3) as routine (routine.id)}
              <button 
                class="starred-routine-compact"
                class:selected={selectedRoutineID === routine.id}
                onclick={() => selectHabit(routine.id)}
              >
                <img 
                  src={routine.iconURL} 
                  alt={routine.name} 
                  class="routine-icon-compact" 
                  title={routine.name}
                />
              </button>
            {/each}
          {/if}
          
          {#if unstarredWithIcons.length > 0 || textRoutines.length > 0}
            <BaseMenu {activator} {content} />
          {/if}
        </div>
      {/if}
    {/if}
  {/if}

  {#snippet activator({ toggle })}
    <button onclick={toggle}
      class="starred-routine-compact more-button"
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
              onclick={() => { selectHabit(routine.id); close(); }}
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
              onclick={() => { selectHabit(routine.id); close(); }}
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
    <ListenToRoutineInstances 
      templateID={selectedRoutineID}
      userID={$user.uid}
      let:routineInstances={instances}
    >
      <ListenToDoc docPath={'/users/' + $user.uid + '/templates/' + selectedRoutineID}
        let:theDoc={selectedRoutine}
      >
        {#if selectedRoutine}
          {@const stats = routineStats.get(selectedRoutineID)}
          <div class="routine-header">
            <h2>{selectedRoutine.name}</h2>
            {#if stats}
              <div class="routine-stats">
                <span class="stat-item">{formatTime(stats.minutesSpent)}</span>
                <span class="stat-divider">•</span>
                <span class="stat-item">completed {stats.timesCompleted} times</span>
              </div>
            {/if}
          </div>
          
          <JournalEntries 
            {selectedRoutine}
            routineInstances={instances}
            showIcon={false}
          />
        {/if}
      </ListenToDoc>
    </ListenToRoutineInstances>
  {:else}
    <div class="select-habit-prompt">
      <span class="material-symbols-outlined">info</span>
      <p>Select a habit to view its instances</p>
    </div>
  {/if}

  <!-- <TemplatePopup /> -->
</div>

<style>
  .habits-view {
    height: 100%;
  }

  .starred-routines-list {
    display: flex;
    flex-direction: column;
    gap: 0px;
    padding: 0 4px;
  }

  .starred-routine-row {
    display: flex;
    align-items: center;
    column-gap: 8px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    position: relative;
    border-radius: 6px;
    min-height: 48px;
  }

  .starred-routine-row:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  .routine-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border-radius: 6px;
    transition: background 0.15s;
  }

  .routine-icon-wrapper.selected {
    background: rgba(0, 89, 125, 0.1);
  }

  .routine-icon {
    width: 48px;
    height: 48px;
    object-fit: contain;
  }

  .routine-bar-container {
    flex: 1;
    height: 5px;
    background: transparent;
    border-radius: 3px;
    overflow: visible;
    position: relative;
  }

  .routine-bar {
    height: 100%;
    background: #4caf50;
    border-radius: 3px;
    transition: width 0.3s ease;
    min-width: 2px;
  }

  .starred-routines-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0px;
    margin-bottom: 12px;
    padding: 0 4px;
  }

  .starred-routine-compact {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    min-width: 48px;
    min-height: 48px;
  }

  .starred-routine-compact:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  .starred-routine-compact.selected {
    background: rgba(0, 89, 125, 0.1);
  }

  .routine-icon-compact {
    width: 40px;
    height: 40px;
    object-fit: contain;
    flex-shrink: 0;
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
    justify-content: flex-start;
    padding: 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    position: relative;
    border-radius: 6px;
    min-height: 60px;
    overflow: hidden;
  }

  .habit-item:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  .habit-item.selected {
    background: rgba(0, 89, 125, 0.1);
  }

  .habit-icon {
    width: 100%;
    height: 100%;
    max-width: 40px;
    max-height: 40px;
    object-fit: contain;
    z-index: 1;
  }

  .time-bar {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    height: 4px;
    background: #4caf50;
    border-radius: 2px;
    transition: width 0.3s ease;
    min-width: 4px;
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
    font-size: var(--font-size-huge);
    opacity: 0.5;
  }

  .more-button {
    background: rgba(0, 0, 0, 0.02);
  }

  .more-icon {
    font-size: var(--font-size-xxl);
    color: #666;
    line-height: 1;
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
    width: 24px;
    height: 24px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .menu-icon-placeholder {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .menu-icon-placeholder .material-symbols-outlined {
    font-size: var(--font-size-lg);
    color: #999;
  }

  .menu-name {
    font-size: var(--font-size-md);
    color: #333;
    flex: 1;
  }

  .routine-header {
    margin-bottom: 20px;
    padding: 0 16px;
  }

  .routine-header h2 {
    margin: 0 0 8px 0;
    font-size: var(--font-size-xxl);
    font-weight: 600;
  }

  .routine-stats {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: var(--font-size-md);
  }

  .stat-divider {
    color: #ccc;
  }
</style>