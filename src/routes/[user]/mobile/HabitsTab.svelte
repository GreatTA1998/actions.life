<script>
  import { user } from '$lib/store'
  import { collection, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { onMount } from 'svelte'
  import ListenToDoc from '../components/Archive/ListenToDoc.svelte'
  import ListenToRoutineInstances from '../components/Archive/ListenToRoutineInstances.svelte'
  import JournalEntries from '../components/Archive/JournalEntries.svelte'
  import BaseMenu from '$lib/components/BaseMenu.svelte'
  import StarButton from '$lib/components/StarButton.svelte'
  import Template from '$lib/db/models/Template.js'
  import { openTemplateEditor } from '../components/Templates/store.js'
  import TemplatePopup from '../components/Templates/components/TemplatePopup/TemplatePopup.svelte'
  import { round } from '$lib/utils/core.js'

  function formatTime(minutes) {
    const roundedMinutes = round(minutes, 0)
    if (roundedMinutes < 60) return `${roundedMinutes} mins`
    const hours = Math.floor(roundedMinutes / 60)
    const remainingMinutes = roundedMinutes % 60
    if (remainingMinutes === 0) {
      return `${hours} hr${hours !== 1 ? 's' : ''}`
    }
    return `${hours} hr${hours !== 1 ? 's' : ''} ${remainingMinutes} min${remainingMinutes !== 1 ? 's' : ''}`
  }

  let routines = $state(null)
  let selectedRoutineID = $state('')
  let routineStats = $state(new Map())
  let maxMinutesSpent = $state(0)
  let fetchedStats = new Set() // Track which routines we've fetched stats for
  let statsLoaded = $state(false) // Track when stats have finished loading

  // Fetch stats for starred routines only once when routines load
  async function fetchStarredStats(routines) {
    const starredWithIcons = routines.filter(r => r.isStarred && r.iconURL)
    let maxTime = 0
    
    // Only fetch stats for routines we haven't fetched yet
    const toFetch = starredWithIcons.filter(r => !fetchedStats.has(r.id))
    
    if (toFetch.length === 0) {
      statsLoaded = true
      return
    }
    
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
    statsLoaded = true
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
      statsLoaded = false
      await fetchStarredStats(routines)
      
      // Auto-select the top starred routine if available
      if (!selectedRoutineID) {
        // Get starred routines with icons and sort by stats (same logic as starredWithIcons)
        const starredWithIconsList = routines
          .filter(r => r.isStarred && r.iconURL)
          .sort((a, b) => {
            const statsA = routineStats.get(a.id) || { minutesSpent: 0 }
            const statsB = routineStats.get(b.id) || { minutesSpent: 0 }
            return statsB.minutesSpent - statsA.minutesSpent
          })
        
        // Select the top starred routine with icon (sorted by stats)
        if (starredWithIconsList.length > 0) {
          selectedRoutineID = starredWithIconsList[0].id
        }
      }
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
    // Scale to max 75% to leave room for hours text
    return (minutes / maxMinutesSpent) * 75
  }

  function formatHours(minutes) {
    if (!minutes) return '0 hrs'
    const roundedMinutes = round(minutes, 0)
    const hours = Math.floor(roundedMinutes / 60)
    return `${hours} hr${hours !== 1 ? 's' : ''}`
  }

  async function toggleStar (routineID, value) {
    await Template.update({ id: routineID, updates: { isStarred: !value } })
  }
</script>

<div class="habits-view">
  <div class="routines-section">
    {#if routines && statsLoaded}
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
                  <div class="routine-bar-wrapper">
                    <div class="routine-bar" style="width: {getBarWidth(stats.minutesSpent)}%"></div>
                    <span class="routine-hours">{formatHours(stats.minutesSpent)}</span>
                  </div>
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
  </div>

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
    <div class="routine-content-section">
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
              <div class="routine-title-row">
                <h2>{selectedRoutine.name}</h2>
                <StarButton 
                  isStarred={selectedRoutine.isStarred}
                  onToggle={() => toggleStar(selectedRoutineID, selectedRoutine.isStarred)}
                />
              </div>
              {#if stats}
                <div class="routine-stats">
                  <span class="stat-item">{formatTime(stats.minutesSpent)}</span>
                  <span class="stat-divider">•</span>
                  <span class="stat-item">completed {stats.timesCompleted} times</span>
                </div>
              {/if}
            </div>
            
            <div class="journal-entries-wrapper">
              <JournalEntries 
                routineInstances={instances}
              />
            </div>
          {/if}
        </ListenToDoc>
      </ListenToRoutineInstances>
    </div>
  {/if}

  <!-- TO-DO: fix rrStr -->
  <!-- <TemplatePopup /> -->
</div>

<style>
  .habits-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    --routine-compact-size: 40px;
    --routine-compact-padding: 2px;
  }

  .routines-section {
    flex-shrink: 0;
  }

  .routine-content-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
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
    min-height: 5px;
    background: transparent;
    border-radius: 3px;
    overflow: visible;
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0; /* Allow flex item to shrink below content size */
  }

  .routine-bar-wrapper {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 5px;
    position: relative;
    min-width: 0; /* Allow flex item to shrink below content size */
  }

  .routine-bar {
    height: 5px;
    background: #4caf50;
    border-radius: 3px;
    transition: width 0.3s ease;
    min-width: 2px;
    flex-shrink: 1; /* Allow bar to shrink if needed */
    max-width: 100%; /* Prevent bar from exceeding wrapper */
  }

  .routine-hours {
    font-size: var(--font-size-sm, 0.875rem);
    color: #666;
    font-weight: 500;
    white-space: nowrap;
    flex-shrink: 0;
    min-width: fit-content;
  }

  .starred-routines-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    margin-bottom: 12px;
    padding: 0 4px;
  }

  .starred-routine-compact {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--routine-compact-padding);
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    width: var(--routine-compact-size);
    height: var(--routine-compact-size);
    box-sizing: border-box;
  }

  .starred-routine-compact:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  .starred-routine-compact.selected {
    background: rgba(0, 89, 125, 0.1);
  }

  .routine-icon-compact {
    width: calc(var(--routine-compact-size) - 2 * var(--routine-compact-padding));
    height: calc(var(--routine-compact-size) - 2 * var(--routine-compact-padding));
    object-fit: contain;
    flex-shrink: 0;
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
    background: transparent;
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
    flex-shrink: 0;
    margin-bottom: 20px;
    padding: 0 16px;
  }

  .journal-entries-wrapper {
    flex: 1;
    min-height: 0;
  }

  .routine-title-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }

  .routine-header h2 {
    margin: 0;
    font-size: var(--font-size-xxl);
    font-weight: 600;
    flex: 1;
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