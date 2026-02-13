<script>
  import { generateRecurrenceDTs } from '$lib/utils/rrule.js'
  import { createTaskInstance } from '/src/routes/[user]/components/Templates/components/TemplatePopup/instances.js'
  import { DateTime } from 'luxon'
  import { getContext, onMount } from 'svelte'
  import { user } from '$lib/store'

  const { User, Template } = getContext('app')

  onMount(async () => {
    const today = DateTime.utc().toFormat('yyyy-MM-dd')
    if (today > $user.lastRanRoutines) { 
      const templates = await Template.getAll()
      
      await Promise.all(
        templates
          .filter(t => t.rrStr)
          .map(template => 
            extendRoutine({ 
              startDT: DateTime.fromISO(template.prevEndISO).plus({ days: 1 }),
              endDT: DateTime.utc().plus({ days: template.previewSpan ?? 14 }),
              template
            }).catch(e => console.error(`Failed to extend template ${template.id}:`, e))
          )
      )
      
      await User.update({ lastRanRoutines: today })
    }
  })

  async function extendRoutine ({ startDT, endDT, template }) {
    const matchingDTs = generateRecurrenceDTs({ 
      startDT, endDT, rrStr: template.rrStr 
    })
    await Promise.all(
      matchingDTs.map(dt => createTaskInstance({ template, dt }))
    )
    await Template.update({ 
      id: template.id, 
      updates: { prevEndISO: endDT.toFormat('yyyy-MM-dd') }
    })
  }
</script>