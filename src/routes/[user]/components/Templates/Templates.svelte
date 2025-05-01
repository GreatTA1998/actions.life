<script>
  import WeekRhythm from './WeekRhythm.svelte'
  import MonthRhythm from './MonthRhythm.svelte'
  import YearRhythm from './YearRhythm.svelte'
  import { getPeriodicity } from '$lib/utils/rrule.js'
  import { popup, template, templates, openTemplateEditor } from './store.js'
  import { user } from '$lib/store'
  import { db } from '$lib/db/init.js'
  import TemplatePopup from './components/TemplatePopup/TemplatePopup.svelte'
  import { onSnapshot, collection } from 'firebase/firestore'
  import { onMount } from 'svelte'

  let yearly = []
  let monthly = []
  let weekly = []
  let iconRoutines = []
  let noIconRoutines = []

  onMount(() => {
    const unsub = onSnapshot(
      collection(db, 'users', $user.uid, 'templates'), 
      snapshot => {
        const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        templates.set(result)

        yearly = filterByType($templates, 'yearly')
        monthly = filterByType($templates, 'monthly')
        weekly = filterByType($templates, 'weekly')
        iconRoutines = weekly.filter(routine => routine.iconURL)
        noIconRoutines = weekly.filter(routine => !routine.iconURL)
      }
    )
    return () => unsub()
  })

  function filterByType (routines, type) {
    return routines
      .filter(routine => getPeriodicity(routine.rrStr) === type)
      .sort((a, b) => a.orderValue - b.orderValue)
  }
</script>

<div style="padding: 48px; height: 100%; overflow-y: auto;">
  <div style="display: flex; width: 90vw; justify-content: space-between; gap: 48px;">
    <div style="display: flex; gap: 16px; flex-wrap: wrap; max-width: 480px; align-content: flex-start;">
      <span class="my-header">
        WEEKLY
      </span>
      {#each iconRoutines as routine (routine.id)}
        <button on:click={() => openTemplateEditor(routine.id)} class="grid gap-0 text-left">
          <img src={routine.iconURL} alt="icon" style="width: 60px; height: 60px;" />
          <WeekRhythm rrStr={routine.rrStr} />
        </button>
      {/each}
    </div>

    <div style="display: grid; gap: 16px; align-items: start; grid-auto-rows: min-content; max-width: 260px;">
      <div style="height: 0px;">

      </div>
      {#each noIconRoutines as routine (routine.id)}
        <button on:click={() => openTemplateEditor(routine.id)} class="grid gap-0 text-left">
          <div class="truncate-to-one-line">{routine.name}</div>
          <WeekRhythm rrStr={routine.rrStr} />
        </button>
      {/each}
    </div>

    <div>
      <span class="my-header">
        MONTHLY
      </span>

      <div style="margin-left: 24px; margin-top: 24px; display: grid; gap: 24px; align-items: start; grid-auto-rows: min-content; max-width: 300px;">
        {#each monthly as routine (routine.id)}
          <button on:click={() => openTemplateEditor(routine.id)} class="grid gap-0 text-left">
            <div class="truncate-to-one-line">{routine.name}</div>
            <MonthRhythm rrStr={routine.rrStr} />
          </button>
        {/each}
      </div>
    </div>

    <div>
      <span class="my-header">
        YEARLY
      </span>

      <div style="margin-left: 24px; margin-top: 24px; display: grid; gap: 24px; align-items: start; grid-auto-rows: min-content;">
        {#each yearly as routine (routine.id)}
          <button on:click={() => openTemplateEditor(routine.id)} class="grid gap-0 text-left">
            <div class="truncate-to-one-line">{routine.name}</div>
            <YearRhythm rrStr={routine.rrStr} />
          </button>
        {/each}
      </div>
    </div>
  </div>

  {#if $popup && $template}
    <TemplatePopup />
  {/if}
</div>

<style>
  :root {
    --rhythm-highlight-color: orange;
  }

  .my-header {
    font-size: 24px;
  }
</style>