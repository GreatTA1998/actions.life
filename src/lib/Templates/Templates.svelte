<script>
  import TemplateColumn from './TemplateColumn.svelte'
  import { onMount } from 'svelte'
  import { user, calendarTasks } from '/src/store'
  import { templates } from './store.js'
  import Template from '/src/db/Template'
  import { filterByType } from './utils.js'

  $: weeklyTasks = filterByType($templates, 'weekly')

  $: monthlyTasks = filterByType($templates, 'monthly')

  $: yearlyTasks = filterByType($templates, 'yearly')

  $: quickTasks = filterByType($templates, 'quick')

  $: {
    if ($calendarTasks) {
      Template.getAll({
        userID: $user.uid,
        includeStats: true
      }).then((result) => {
        $templates = result
      })
    }
  }

  onMount(async () => {
    $templates = await Template.getAll({
      userID: $user.uid,
      includeStats: true
    })
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
