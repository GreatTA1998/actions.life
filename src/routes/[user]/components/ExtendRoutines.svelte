<script>
  import { generateRecurrenceDTs } from '$lib/utils/rrule.js'
  import { getFirestoreCollection, updateFirestoreDoc } from '$lib/db/helpers.js'
  import { createTaskInstance } from '/src/routes/[user]/components/Templates/components/TemplatePopup/instances.js'
  import { DateTime } from 'luxon'
  import { getContext, onMount } from 'svelte'

  const { user, Template } = getContext('app')
  const { uid, lastRanRoutines } = $user

  onMount(async () => {
    // TRIGGERS BASED ON UTC TIME
    // because it's a trigger that runs once in a device independent way, we can't rely on contradicting local times across devices, and must use UTC
    // TO-DO: after the logic is stable, migrate a Cloud Function or server
    const utc = DateTime.utc().toFormat('yyyy-MM-dd')
    if (utc > lastRanRoutines) { 
      updateFirestoreDoc(`/users/${uid}`, { lastRanRoutines: utc }) // we rely on indempotent IDs suffixed by yyyy-MM-dd to prevent duplicate generations

      console.log("extending routines, lastRanRoutines =", lastRanRoutines)
      const templates = await getFirestoreCollection('/users/' + uid + '/templates')

      // LOCAL TIME (assumes user never changes timezones)
      // from (prevEnd + 1) to (today + previewSpan)
      for (const template of templates) {
        const { rrStr, prevEndISO, previewSpan } = template
        const localDT = DateTime.now()
        const utcBuffer = 1 // the preview window might not update if it's a new day in local time but not in UTC
        if (rrStr) { 
          extendRoutine({ 
            startDT: DateTime.fromISO(prevEndISO).plus({ days: 1 }),
            endDT: localDT.plus({ days: (previewSpan || 14) + utcBuffer }), // `previewSpan` is not always defined
            rrStr,
            template
          })
        }
      }
    }
  })

  function extendRoutine ({ startDT, endDT, rrStr, template }) {
    Template.update({ id: template.id, updates: { 
      prevEndISO: endDT.toFormat('yyyy-MM-dd') 
    }})
    const matchingDTs = generateRecurrenceDTs({ rrStr, endDT, startDT })
    for (const dt of matchingDTs) {
      createTaskInstance({ template, dt }) 
    }
  }
</script>