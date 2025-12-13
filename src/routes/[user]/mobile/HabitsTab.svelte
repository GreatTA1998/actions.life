<script>
  import HabitsTabFullDetails from './HabitsTabFullDetails.svelte'
  import TemplatePopup from '../components/Templates/components/TemplatePopup/TemplatePopup.svelte'
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import Template from '$lib/db/models/Template.js'
  import { openTemplateEditor, templates, popup } from '../components/Templates/store.js'
  import { formatHours } from '$lib/utils/core.js'
  import { collection, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { getContext, onMount } from 'svelte'

  const { user } = getContext('app')

  let selectedRoutineID = $state('')
  let stats = $state(new Map())

  let maxMinutesSpent = $derived(Math.max(0, ...Array.from(stats.values()).map(s => s.minutesSpent)))
  let starredRoutines = $derived.by(() => $templates.filter(r => r.isStarred))
  let unstarredRoutines = $derived($templates.filter(r => !r.isStarred))

  $effect(async () => {
    for (const routine of starredRoutines) {
      if (stats.has(routine.id)) continue 
      else {
        const result = await Template.getTotalStats({ id: routine.id })
        stats.set(routine.id, result)
        stats = new Map(stats) // force reactivity update
      }
    }
  })

  onMount(async () => {
    listenToRoutines()
  })

  async function listenToRoutines() {
    const ref = collection(db, '/users/' + $user.uid + '/templates')
    onSnapshot(ref, async (querySnapshot) => {
      templates.set(
        querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })
      ))
    })
  }

  function select (routineID) {
    if (selectedRoutineID === routineID) openTemplateEditor(routineID)
    else selectedRoutineID = routineID
  }

  function getBarWidth (minutes) {
    return (minutes / maxMinutesSpent) * 75 // Scale to max 75% to leave room for hours text
  }
</script>

<div class="habits-view" style="width: 100%;">
  {#if starredRoutines?.length > 0}
    <div style="display: flex; flex-direction: column; padding: 0 4px;">
      {#each starredRoutines as routine (routine.id)}
        <button onclick={() => select(routine.id)}
          class="routine-row"
          class:selected={selectedRoutineID === routine.id}
        >
          {@render routineItem({ routine })}

          {#if stats.has(routine.id)}
            <div class="routine-bar-container">
              <div class="routine-bar-wrapper">
                <div class="routine-bar" style="width: {getBarWidth(stats.get(routine.id).minutesSpent)}%"></div>
                <span class="routine-hours">{formatHours(stats.get(routine.id).minutesSpent)}</span>
              </div>
            </div>
          {/if}
        </button>
      {/each}
    </div>
    
    {#if unstarredRoutines.length > 0}
      <div class="overflow-routines-grid">        
        {#if unstarredRoutines.some(r => !r.iconURL)}
          <PopoverMenu {activator} {content} />
        {/if}
      </div>
    {/if}
  {/if}

  {#snippet activator({ setPosition, popovertarget })}
    <button {popovertarget} onclick={setPosition} class="routine-compact more-button">
      <span class="material-symbols-outlined more-icon">more_horiz</span>
    </button>
  {/snippet}

  {#snippet content({ close })}
    <div class="more-menu-content">
      {#each unstarredRoutines as routine (routine.id)}
        <button onclick={() => { select(routine.id); close(); }}
          class="menu-item"
          class:selected={selectedRoutineID === routine.id}
        >
          {@render routineItem({ routine })}
        </button>
      {/each}
    </div>
  {/snippet}

  {#if selectedRoutineID}
    <HabitsTabFullDetails {selectedRoutineID} {stats} />
  {/if}

  {#if $popup}
    <TemplatePopup />
  {/if}

  {#snippet routineItem({ routine })}
    <div class="flexbox content-center" style="width: 240px;">
      {#if routine.iconURL}
        <img src={routine.iconURL} alt={routine.name} class="routine-icon" />
      {/if}
      <span>{routine.name}</span>
    </div>
  {/snippet}
</div>

<style>
  .habits-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    --routine-compact-size: 40px;
    --routine-compact-padding: 2px;
  }

  .scrollable-flexbox {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .routine-row {
    display: flex;
    align-items: center;
    column-gap: 8px;
    padding: 8px;
    min-height: 48px;
  }

  .routine-row.selected {
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
    min-width: 0; 
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
    border-radius: 6px;
    padding: var(--routine-compact-padding);
    width: var(--routine-compact-size);
    height: var(--routine-compact-size);
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

  .more-icon {
    font-size: var(--font-size-xxl);
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
    border-radius: 8px;
    text-align: left;
  }

  .menu-item.selected {
    background: rgba(0, 89, 125, 0.08);
  }
</style>