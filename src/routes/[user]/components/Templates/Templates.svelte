<script>
  import WeekRhythm from './WeekRhythm.svelte'
  import MonthRhythm from './MonthRhythm.svelte'
  import YearRhythm from './YearRhythm.svelte'
  import { popup, template, templates, openTemplateEditor } from './store.js'
  import { user } from '$lib/store'
  import { onSnapshot, collection } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import TemplatePopup from './components/TemplatePopup/TemplatePopup.svelte'
  import { getPeriod } from '/src/routes/[user]/components/Templates/crontab.js'
  import { onMount } from 'svelte'

  let weeklyTasks = []
  let monthlyTasks = []
  let yearlyTasks = []
  let quickTasks = []

  let frequentRoutines = []
  let iconHabits = []
  let noIconHabits = []

  onMount(() => {
    const unsub = onSnapshot(
      collection(db, 'users', $user.uid, 'templates'), 
      snapshot => {
        const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        templates.set(result)

        weeklyTasks = filterByType($templates, 'weekly')
        monthlyTasks = filterByType($templates, 'monthly')

        frequentRoutines = [...quickTasks, ...weeklyTasks]
        iconHabits = frequentRoutines.filter(task => task.iconURL)
        noIconHabits = frequentRoutines.filter(task => !task.iconURL)

        yearlyTasks = filterByType($templates, 'yearly')
        quickTasks = filterByType($templates, 'quick')
      }
    )
    return () => unsub()
  })

  // this will need to be migrated to rrStr
  function filterByType (tasks, type) {
    return tasks.filter(task => getPeriod(task.crontab) === type)
      .sort((a, b) => a.orderValue - b.orderValue)
  }
</script>

<div style="padding: 48px; height: 100%; overflow-y: auto;">
  {#if $popup && $template}
    <TemplatePopup />
  {/if}

  <div style="display: flex; width: 90vw; justify-content: space-between; gap: 48px;">
    <div style="display: flex; gap: 16px; flex-wrap: wrap; max-width: 480px; align-content: flex-start;">
      <span class="my-header">
        WEEKLY
      </span>
      {#each iconHabits as habit}
        <div on:click={() => openTemplateEditor(habit.id)} on:keydown style="cursor: pointer;">
          <img src={habit.iconURL} alt="icon" style="width: 60px; height: 60px;" />
          <WeekRhythm crontab={habit.crontab} rrStr={habit.rrStr} />
        </div>
      {/each}
    </div>

    <div style="display: grid; gap: 16px; align-items: start; grid-auto-rows: min-content; max-width: 260px;">
      <div style="height: 0px;">

      </div>
      {#each noIconHabits as habit}
        <div on:click={() => openTemplateEditor(habit.id)} on:keydown style="display: grid; gap: 2px; cursor: pointer;">
          <div class="truncate-to-one-line">{habit.name}</div>
          <WeekRhythm crontab={habit.crontab} rrStr={habit.rrStr} />
        </div>
      {/each}
    </div>

    <div>
      <span class="my-header">
        MONTHLY
      </span>

      <div style="margin-left: 24px; margin-top: 24px; display: grid; gap: 24px; align-items: start; grid-auto-rows: min-content; max-width: 300px;">
        {#each monthlyTasks as task}
          <div on:click={() => openTemplateEditor(task.id)} on:keydown 
            style="display: grid; gap: 0px; cursor: pointer;"
          >
            <div class="truncate-to-one-line">{task.name}</div>
            <MonthRhythm crontab={task.crontab} rrStr={task.rrStr} />
          </div>
        {/each}
      </div>
    </div>

    <div>
      <span class="my-header">
        YEARLY
      </span>

      <div style="margin-left: 24px; margin-top: 24px; display: grid; gap: 24px; align-items: start; grid-auto-rows: min-content;">
        {#each yearlyTasks as task}
          <div on:click={() => openTemplateEditor(task.id)} on:keydown 
            style="display: grid; gap: 0px; cursor: pointer;"
          >
            <div class="truncate-to-one-line">{task.name}</div>
            <YearRhythm crontab={task.crontab} rrStr={task.rrStr} />
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  :root {
    --rhythm-highlight-color: orange;
  }

  .my-header {
    font-size: 24px;
  }
</style>