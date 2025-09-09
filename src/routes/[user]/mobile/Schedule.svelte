{#if $uniqueEvents}
  <div style="background: #f8f9fa; padding: 16px 0px;">
    <div style="margin-left: 8px; margin-bottom: 8px;">
      <SimpleToggle bind:checked={$user.hideRoutines} label="Exclude routines" />
    </div>

    <div style="display: flex; flex-direction: column; gap: 24px;">
      {#each Object.keys($uniqueEvents) as iso, i}
        <ScheduleGap {i} {iso} />

        <ScheduleDay 
          tasksThisDay={[
            ...$uniqueEvents[iso].hasStartTime || [],
            ...($uniqueEvents[iso].noStartTime?.hasIcon || []),
            ...($uniqueEvents[iso].noStartTime?.noIcon || [])
          ]} 
          simpleDateISO={iso}
        />
      {/each}
    </div>
  </div>
{/if}

<script>
  import ScheduleGap from './ScheduleGap.svelte'
  import ScheduleDay from './ScheduleDay.svelte'
  import SimpleToggle from '$lib/components/SimpleToggle.svelte'
  import { organizeToGroups } from '/src/routes/[user]/components/Calendar/service.js'
  import { db } from '$lib/db/init.js'  
  import { uniqueEvents, user, updateCache } from '$lib/store'
  import { page } from '$app/stores'
  import { collection, query, where, onSnapshot } from 'firebase/firestore'
  import { DateTime } from 'luxon'
  import { onMount, onDestroy } from 'svelte'

  let userID = $derived($page.params.user)
  let unsub = $state(() => {})
  let tasks = $state(null)
  let tasksNoRoutines = $derived(tasks ? tasks.filter(task => task.templateID === '') : null)

  $effect(() => {
    if (tasks && $user.uid) { // $user.uid checks for hydration
      uniqueEvents.set(
        organizeToGroups(
          $user.hideRoutines ? tasksNoRoutines : tasks
        )
      ) 
    }
  })

  onMount(() => {
    const today = DateTime.now()
    const q = query( // WARNING: unlike the calendar, schedule relies on startDateISO not treeISOs, so it doesn't fetch hierarchy currently
      collection(db, `/users/${userID}/tasks`),
      where('startDateISO', '>=', today.toFormat('yyyy-MM-dd')),
      where('startDateISO', '<=', today.plus({ years: 2 }).toFormat('yyyy-MM-dd'))
    ) 
    unsub = onSnapshot(q, snapshot => {
      tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      updateCache(tasks)
    })
  })

  onDestroy(() => {
    if (unsub) unsub()
  })
</script>