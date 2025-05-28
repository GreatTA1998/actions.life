import { user } from './userStore.js'
import { getFirestoreCollection, updateFirestoreDoc } from '$lib/db/helpers.js'
import { fillTaskInstances } from '/src/routes/[user]/components/Templates/components/TemplatePopup/instances.js'
import { DateTime } from 'luxon'

user.subscribe(async ($user) => {
  if ($user.uid) {
    // <= is important, because an iPad that's on a different timezone and a laptop will cause an infinite loop
    if ($user.lastRanRoutines <= DateTime.now().toFormat('yyyy-MM-dd')) { 
      console.log("auto-generating routines, $user.lastRanRoutines =", $user.lastRanRoutines)

      const templates = await getFirestoreCollection('/users/' + $user.uid + '/templates')
      for (const template of templates) {
        fillTaskInstances({ 
          template, 
          startISO: template.prevEndISO || DateTime.now().toFormat('yyyy-MM-dd'),
          uid: $user.uid 
        })
      }
      // not safe as it doesn't await, but good enough for now.
      // also there doesn't seem to be a way to prevent duplicate generations e.g. multiple tabs etc.
      // so we handle it by locking the ID in `createTaskInstance`
      updateFirestoreDoc(`/users/${$user.uid}`, { 
        lastRanRoutines: DateTime.now().toFormat('yyyy-MM-dd') 
      })
    }
  }
})