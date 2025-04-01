<script>
  import TemplateColumn from './TemplateColumn.svelte'
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

  onMount(() => {
    const unsub = onSnapshot(
      collection(db, 'users', $user.uid, 'templates'), 
      snapshot => {
        const result = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        templates.set(result)

        weeklyTasks = filterByType($templates, 'weekly')
        monthlyTasks = filterByType($templates, 'monthly')
        yearlyTasks = filterByType($templates, 'yearly')
        quickTasks = filterByType($templates, 'quick')
      }
    )
    return () => unsub()
  })
</script>

<h4 class="bug-notice">
  Known Bugs:
  <ul>
    <li> If you deselect all the days, it does not delete tasks from the calendar, to handle: delete template or just set a new day of the week</li>
  </ul>
</h4>
<div style="padding: 48px;">
  <div style="font-size: 32px; margin-bottom: 48px;">Templates</div>
  <div style="display: flex; width: 90vw; justify-content: space-between;">
    <TemplateColumn templates={quickTasks} crontab="" />
    <TemplateColumn templates={weeklyTasks} crontab="0 0 * * 0" />
    <TemplateColumn templates={monthlyTasks} crontab="0 0 0 * *" />
    <TemplateColumn templates={yearlyTasks} crontab="0 0 0 0 *" />
  </div>
</div>

<style src="./Templates.css" lang="postcss">
</style>
