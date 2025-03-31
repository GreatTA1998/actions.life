{#if $uniqueEvents}
  <div class="schedule-container">
    <ToggleSwitch
      label="Display scheduled routines too"
      isChecked={$user.includeRoutinesInEvents}
      on:change={async (e) => {
        const newValue = e.detail.checked
        updateFirestoreDoc(`users/${$user.uid}`, { includeRoutinesInEvents: newValue })
      }}
    />

    <div class="events-list">
      {#each Object.keys($uniqueEvents) as simpleDateISO}
        {#if $uniqueEvents[simpleDateISO]}
          <ScheduleViewDay 
            tasksThisDay={$uniqueEvents[simpleDateISO]} 
            {simpleDateISO}
          />
        {/if}
      {/each}
    </div>
  </div>
{/if}

<script>
  import ScheduleViewDay from './ScheduleViewDay.svelte'
  import ToggleSwitch from '$lib/components/ToggleSwitch.svelte'
  import { collection, query, where, onSnapshot } from 'firebase/firestore'
  import { DateTime } from 'luxon'
  import { onDestroy } from 'svelte'
  import { organizeToGroups } from '/src/routes/[user]/components/Calendar/service.js'
  import { db } from '$lib/db/init.js'  
  import { updateFirestoreDoc } from '$lib/db/helpers.js'
  import { uniqueEvents, user } from '$lib/store'

  let unsub
  let futureTasks

  $: if ($user.uid) {
    // NOTE: currently triggers twice...but usable for now
    listenToItinerary($user.uid, !$user.includeRoutinesInEvents)
  }

  onDestroy(() => {
    if (unsub) unsub()
  })

  //  - listen to date range, suffices for startDateISO because children will be fetched on popup rendering unlike calendar view
  async function listenToItinerary (uid, hideRoutines = false) {
    if (unsub) {
      unsub()
      uniqueEvents.set(null)
    }

    const today = DateTime.now()
    const q = query(
      collection(db, `/users/${uid}/tasks`),
      where('startDateISO', '>=', today.toFormat('yyyy-MM-dd')),
      where('startDateISO', '<=', today.plus({ years: 2 }).toFormat('yyyy-MM-dd'))
    )
    unsub = onSnapshot(q, snapshot => {
      console.log("snapshot =", snapshot)
      futureTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      if (hideRoutines) {
        futureTasks = futureTasks.filter(task => task.templateID === '')
      }
      uniqueEvents.set(
        organizeToGroups(futureTasks)
      )
      console.log('$uniqueEvents =', uniqueEvents)
    })
  }
</script>

<style>
  .schedule-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #f5f5f5;
  }

  .events-list {
    padding: 24px;
    display: flex;
    flex-direction: column;
    row-gap: 12px;
    flex: 1;
  }
</style>