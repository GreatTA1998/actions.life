<script>
  import { generateRecurrenceDTs } from '$lib/utils/rrule.js'
  import { DateTime } from 'luxon'
  import { getContext, onMount } from 'svelte'
  import { user } from '$lib/store'
  import { runTransaction, doc } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import Task from '$lib/db/models/Task.js'

  const { Template } = getContext('app')

  onMount(async () => {
    const today = DateTime.utc().toFormat('yyyy-MM-dd')
    const userRef = doc(db, `/users/${$user.uid}`)

    // prevent race condition from two devices opening the app
    const claimed = await runTransaction(db, async (tx) => {
      const snap = await tx.get(userRef)
      if (today > snap.data().lastRanRoutines) {
        tx.update(userRef, { lastRanRoutines: today })
        return true
      }
      return false
    })

    if (claimed) {
      const templates = await Template.getAll()
      await Promise.all(
        templates
          .filter(t => t.rrStr && t.prevEndISO)
          .map(template => 
            extendRoutine({ 
              startDT: DateTime.fromISO(template.prevEndISO).plus({ days: 1 }), // startOf('day'), is needed technically, but rrFloat also removes timing
              endDT: DateTime.utc().plus({ days: template.previewSpan }), // startOf('day')
              template
            })
          )
      )
    }
  })

  async function extendRoutine ({ startDT, endDT, template }) {
    const matchingDTs = generateRecurrenceDTs({ 
      startDT, endDT, rrStr: template.rrStr 
    })
    await Promise.all(
      matchingDTs.map(dt => 
        Task.fromTemplate({ 
          template,
          modifiers: {
            startDateISO: dt.toFormat('yyyy-MM-dd'),
            onList: false
          }
        })
      )
    )
    return Template.update({ 
      id: template.id, 
      kvChanges: { prevEndISO: endDT.toFormat('yyyy-MM-dd') }
    })
  }
</script>