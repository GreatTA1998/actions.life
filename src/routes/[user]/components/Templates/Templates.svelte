<script>
  import TemplateColumn from './TemplateColumn.svelte'
  import WeekRhythm from './WeekRhythm.svelte'
  import { onMount } from 'svelte'
  import { user } from '/src/lib/store'
  import { templates } from './store.js'
  import { filterByType } from './utils.js'
  import { onSnapshot, collection } from 'firebase/firestore'
  import { db } from '/src/lib/db/init.js'

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
</script>

<div style="padding: 48px; height: 100%;">
  <div style="font-size: 16px; font-color: rgb(120, 120, 120)">
    Frequent Routines
  </div>

  <div style="display: flex; width: 90vw; justify-content: space-between;">
    <div style="display: flex; gap: 16px; flex-wrap: wrap; max-width: 480px; align-content: flex-start;">
      {#each iconHabits as habit}
        <div>
          <img src={habit.iconURL} alt="icon" style="width: 60px; height: 60px;" />
          <WeekRhythm crontab={habit.crontab} />
        </div>
      {/each}
    </div>

    <div style="display: grid; gap: 16px; align-items: start; grid-auto-rows: min-content;">
      {#each noIconHabits as habit}
        <div style="display: grid; gap: 2px;">
          <div>{habit.name}</div>
          <WeekRhythm crontab={habit.crontab} />
        </div>
      {/each}
    </div>

    <!-- <TemplateColumn templates={quickTasks} crontab="" />
    <TemplateColumn templates={[...quickTasks,...weeklyTasks]} crontab="0 0 * * 0" /> -->
    <TemplateColumn templates={monthlyTasks} crontab="0 0 0 * *" />
    <TemplateColumn templates={yearlyTasks} crontab="0 0 0 0 *" />
  </div>
</div>