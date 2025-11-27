<script>
  import { user } from '$lib/store'
  import { collection, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { onMount } from 'svelte'
  import ListenToDoc from '../components/Archive/ListenToDoc.svelte'
  import ListenToRoutineInstances from '../components/Archive/ListenToRoutineInstances.svelte'
  import JournalEntries from '../components/Archive/JournalEntries.svelte'
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import StarButton from '$lib/components/StarButton.svelte'
  import Template from '$lib/db/models/Template.js'
  import { openTemplateEditor, templates, popup, template } from '../components/Templates/store.js'
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

  // Fetch stats for starred routines (they're most likely to appear in top positions)
  async function fetchStats(routines) {
    const toFetch = routines
      .filter(r => r.isStarred && !fetchedStats.has(r.id))
    
    if (toFetch.length === 0) {
      statsLoaded = true
      return
    }
    
    const results = await Promise.all(
      toFetch.map(routine => 
        Template.getTotalStats({ id: routine.id })
          .then(stats => ({ id: routine.id, stats }))
          .catch(() => ({ id: routine.id, stats: { minutesSpent: 0, timesCompleted: 0 } }))
      )
    )
    
    let maxTime = 0
    results.forEach(({ id, stats }) => {
      fetchedStats.add(id)
      routineStats.set(id, stats)
      maxTime = Math.max(maxTime, stats.minutesSpent || 0)
    })
    
    // Include existing stats in max calculation
    routineStats.forEach(stats => {
      maxTime = Math.max(maxTime, stats.minutesSpent || 0)
    })
    
    maxMinutesSpent = maxTime
    routineStats = new Map(routineStats) // trigger reactivity
    statsLoaded = true
  }

  // Single sorted list with clear priority: starred+icon > starred > icon > rest, then by stats
  let sortedRoutines = $derived.by(() => {
    if (!routines) return []
    return [...routines].sort((a, b) => {
      // Priority score: starred+icon (3), starred (2), icon (1), neither (0)
      const score = r => (r.isStarred ? 2 : 0) + (r.iconURL ? 1 : 0)
      const scoreDiff = score(b) - score(a)
      if (scoreDiff !== 0) return scoreDiff
      // Then by time spent
      const statsA = routineStats.get(a.id)?.minutesSpent || 0
      const statsB = routineStats.get(b.id)?.minutesSpent || 0
      if (statsA !== statsB) return statsB - statsA
      // Then alphabetically
      return (a.name || '').localeCompare(b.name || '')
    })
  })

  // Top 3 get the bar treatment, rest go to overflow
  let topRoutines = $derived(sortedRoutines.slice(0, 3))
  let overflowRoutines = $derived(sortedRoutines.slice(3))

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
      templates.set(temp)
      
      // Fetch stats for starred routines
      statsLoaded = false
      await fetchStats(routines)
      
      // Auto-select first routine (sortedRoutines already has correct priority)
      if (!selectedRoutineID && routines.length > 0) {
        selectedRoutineID = sortedRoutines[0]?.id
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
    {#if routines?.length > 0 && statsLoaded}
      <!-- Top routines with bars -->
      <div class="top-routines-list">
        {#each topRoutines as routine (routine.id)}
          <button 
            class="routine-row"
            class:selected={selectedRoutineID === routine.id}
            onclick={() => selectHabit(routine.id)}
          >
            {#if routine.iconURL}
              <img src={routine.iconURL} alt={routine.name} class="routine-icon" />
              <div class="routine-bar-container">
                {#if routineStats.has(routine.id)}
                  {@const stats = routineStats.get(routine.id)}
                  <div class="routine-bar-wrapper">
                    <div class="routine-bar" style="width: {getBarWidth(stats.minutesSpent)}%"></div>
                    <span class="routine-hours">{formatHours(stats.minutesSpent)}</span>
                  </div>
                {/if}
              </div>
            {:else}
              <span class="routine-name-text">{routine.name}</span>
              {#if routineStats.has(routine.id)}
                {@const stats = routineStats.get(routine.id)}
                <span class="routine-hours">{formatHours(stats.minutesSpent)}</span>
              {/if}
            {/if}
          </button>
        {/each}
      </div>
      
      <!-- Overflow routines -->
      {#if overflowRoutines.length > 0}
        <div class="overflow-routines-grid">
          {#each overflowRoutines.filter(r => r.iconURL) as routine (routine.id)}
            <button 
              class="routine-compact"
              class:selected={selectedRoutineID === routine.id}
              onclick={() => selectHabit(routine.id)}
            >
              <img src={routine.iconURL} alt={routine.name} class="routine-icon-compact" />
            </button>
          {/each}
          
          {#if overflowRoutines.some(r => !r.iconURL)}
            <PopoverMenu {activator} {content} />
          {/if}
        </div>
      {/if}
    {/if}
  </div>

  {#snippet activator({ setPosition, popovertarget })}
    <button {popovertarget} onclick={setPosition} class="routine-compact more-button">
      <span class="material-symbols-outlined more-icon">more_horiz</span>
    </button>
  {/snippet}

  {#snippet content({ close })}
    <div class="more-menu-content">
      {#each overflowRoutines.filter(r => !r.iconURL) as routine (routine.id)}
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

  {#if $popup && $template}
    <TemplatePopup />
  {/if}
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

  .top-routines-list {
    display: flex;
    flex-direction: column;
    padding: 0 4px;
  }

  .routine-row {
    display: flex;
    align-items: center;
    column-gap: 8px;
    padding: 8px 12px;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 6px;
    min-height: 48px;
  }

  .routine-row:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  .routine-row.selected {
    background: rgba(0, 89, 125, 0.1);
  }

  .routine-icon {
    width: 48px;
    height: 48px;
    object-fit: contain;
    flex-shrink: 0;
  }

  .routine-name-text {
    flex: 1;
    font-size: var(--font-size-md);
    color: #333;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
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

  .overflow-routines-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    margin-bottom: 12px;
    padding: 0 4px;
  }

  .routine-compact {
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

  .routine-compact:hover {
    background: rgba(0, 0, 0, 0.04);
  }

  .routine-compact.selected {
    background: rgba(0, 89, 125, 0.1);
  }

  .routine-icon-compact {
    width: calc(var(--routine-compact-size) - 2 * var(--routine-compact-padding));
    height: calc(var(--routine-compact-size) - 2 * var(--routine-compact-padding));
    object-fit: contain;
    flex-shrink: 0;
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