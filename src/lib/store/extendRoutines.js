import { user } from './userStore.js'
import { getFirestoreCollection, updateFirestoreDoc } from '$lib/db/helpers.js'
import { fillTaskInstances } from '/src/routes/[user]/components/Templates/components/TemplatePopup/instances.js'
import { DateTime } from 'luxon'

user.subscribe(async ($user) => {
  if ($user.uid) {
    if ($user.lastRanRoutines !== DateTime.now().toFormat('yyyy-MM-dd')) {
      console.log("auto-generating routines")

      const templates = await getFirestoreCollection('/users/' + $user.uid + '/templates')
      for (const template of templates) {
        fillTaskInstances({ 
          template, 
          startISO: template.prevEndISO || DateTime.now().toFormat('yyyy-MM-dd'),
          uid: $user.uid 
        })
      }
      // not safe as it doesn't await, but good enough for now.
      updateFirestoreDoc(`/users/${$user.uid}`, { 
        lastRanRoutines: DateTime.now().toFormat('yyyy-MM-dd') 
      })
    }
  }
})