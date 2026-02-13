<script>
  import { generateRecurrenceDTs } from '$lib/utils/rrule.js'
  import { createTaskInstance } from '/src/routes/[user]/components/Templates/components/TemplatePopup/instances.js'
  import { DateTime } from 'luxon'
  import { getContext, onMount } from 'svelte'
  import { user } from '$lib/store'

  const { User, Template } = getContext('app')

  onMount(async () => {
    const todayISO = DateTime.utc().toFormat('yyyy-MM-dd')
    if (todayISO <= $user.lastRanRoutines) {
      return
    }

    const templates = (await Template.getAll()).filter(template => template.rrStr)
    const failures = []

    for (const template of templates) {
      try {
        await extendRoutine({ template })
      } catch (error) {
        failures.push({
          templateID: template.id,
          error: error?.message ?? String(error)
        })
      }
    }

    if (failures.length > 0) {
      console.error('Routine auto-extension failures. Keeping lastRanRoutines unchanged for retry.', failures)
      return
    }

    await User.update({ lastRanRoutines: todayISO })
  })

  async function extendRoutine ({ template }) {
    const endDT = DateTime.utc().plus({ days: template.previewSpan ?? 14 }).startOf('day')
    const startDT = getStartDT(template)
    if (startDT.toMillis() > endDT.toMillis()) {
      return
    }

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

  function getStartDT (template) {
    const prevEndDT = DateTime.fromISO(template.prevEndISO)
    if (prevEndDT.isValid) {
      return prevEndDT.plus({ days: 1 }).startOf('day')
    }

    console.warn(`Template ${template.id} has invalid prevEndISO "${template.prevEndISO}". Falling back to today.`)
    return DateTime.utc().startOf('day')
  }
</script>