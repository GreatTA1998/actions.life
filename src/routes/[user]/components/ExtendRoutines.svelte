<script>
  import { generateRecurrenceDTs } from '$lib/utils/rrule.js'
  import { getTemplateTree } from '/src/routes/[user]/components/Templates/components/TemplatePopup/instances.js'
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
              startDT: DateTime.fromISO(template.prevEndISO).plus({ days: 1 }), // startOf('day'), is needed technically, but rrFloat also removes timing
              endDT: DateTime.utc().plus({ days: template.previewSpan }), // startOf('day')
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
      matchingDTs.map(dt => 
        getTemplateTree({ 
          template,
          modifiers: {
            startDateISO: dt.toFormat('yyyy-MM-dd'),
            parentID: '' // quickfix: force no parentID, ensure no parentID from corrupted template
          },
          idempotentISO: dt.toFormat('yyyy-MM-dd')
        })
      )
    )
    return Template.update({ 
      id: template.id, 
      kvChanges: { prevEndISO: endDT.toFormat('yyyy-MM-dd') }
    })
  }
</script>