<script>
  import { generateRecurrenceDTs } from '$lib/utils/rrule.js'
  import { createTaskInstance } from '/src/routes/[user]/components/Templates/components/TemplatePopup/instances.js'
  import { DateTime } from 'luxon'
  import { getContext, onMount } from 'svelte'

  const { user, User, Template } = getContext('app')

  onMount(async () => {
    const today = DateTime.utc().toFormat('yyyy-MM-dd')
    console.log('today', today)
    console.log('$user.lastRanRoutines', $user.lastRanRoutines)
    if (today > $user.lastRanRoutines) { 
      for (const template of await Template.getAll()) {
        if (template.rrStr) { // required because '' will fail the `generateRecurrenceDTs` function
          extendRoutine({ 
            startDT: DateTime.fromISO(template.prevEndISO).plus({ days: 1 }),

            // || 14: `previewSpan` is not always defined
            // +1: the preview window might not update if it's a new day in local time but not in UTC
            endDT: DateTime.now().plus({ days: (template.previewSpan || 14) + 1 }),
            template
          })
        }
      }
      // think about error boundaries
      User.update({ lastRanRoutines: today }) // we rely on indempotent IDs suffixed by yyyy-MM-dd to prevent duplicate generations
    }
  })

  function extendRoutine ({ startDT, endDT, template }) {
    console.log('extendRoutine', startDT, endDT, template)
    Template.update({ id: template.id, updates: { prevEndISO: endDT.toFormat('yyyy-MM-dd') }})
    const matchingDTs = generateRecurrenceDTs({ startDT, endDT, rrStr: template.rrStr })
    for (const dt of matchingDTs) {
      createTaskInstance({ template, dt }) 
    }
  }
</script>