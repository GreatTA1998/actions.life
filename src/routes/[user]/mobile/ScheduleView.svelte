{#if $uniqueEvents}
  <div class="schedule-container">
    <h1 class="title">Itinerary</h1>
    <p class="description">High density view for everything scheduled</p>
    <div class="events-list">
      {#each Object.keys($uniqueEvents) as simpleDateISO}
        {#if $uniqueEvents[simpleDateISO]}
          <ScheduleViewDay 
            tasksThisDay={[
              ...$uniqueEvents[simpleDateISO].hasStartTime || [],
              ...($uniqueEvents[simpleDateISO].noStartTime?.hasIcon || []),
              ...($uniqueEvents[simpleDateISO].noStartTime?.noIcon || [])
            ]} 
            {simpleDateISO}
          />
        {/if}
      {/each}
    </div>
  </div>
{/if}

<script>
  import ScheduleViewDay from './ScheduleViewDay.svelte'
  import { collection, query, where, onSnapshot } from 'firebase/firestore'
  import { DateTime } from 'luxon'
  import { onDestroy } from 'svelte'
  import { organizeToGroups } from '/src/routes/[user]/components/Calendar/service.js'
  import { db } from '$lib/db/init.js'  
  import { uniqueEvents, user } from '$lib/store'
  import { updateCache } from '$lib/store'

  let unsub
  let futureTasks

  $: if ($user.uid) {
    listenToItinerary($user.uid)
  }

  onDestroy(() => {
    if (unsub) unsub()
  })

  async function listenToItinerary(uid) {
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
      futureTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      updateCache(futureTasks)

      if (hideRoutines) {
        futureTasks = futureTasks.filter(task => task.templateID === '')
      }
      const organized = organizeToGroups(futureTasks)

      uniqueEvents.set(organized)
    })
  }
</script>

<style>
  .schedule-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #f8f9fa;
    padding: 16px;
  }

  .title {
    font-size: 24px;
    color: #202124;
    margin: 0 0 8px 0;
  }

  .description {
    color: #5f6368;
    margin: 0 0 24px 0;
    font-size: 14px;
  }

  .events-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
</style>