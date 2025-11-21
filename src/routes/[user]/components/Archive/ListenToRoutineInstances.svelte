<script>
  import { onDestroy } from 'svelte'
  import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
  import { db } from '/src/lib/db/init.js'

  export let templateID = ''
  export let userID = ''

  let routineInstances = null
  let unsubListener = null

  $: if (templateID && userID) {
    destroyAndCreateListener()
  } else {
    // Clean up if templateID or userID becomes empty
    if (unsubListener) {
      unsubListener()
      unsubListener = null
    }
    routineInstances = null
  }

  function destroyAndCreateListener() {
    routineInstances = null
    if (unsubListener) unsubListener()
    
    const ref = collection(db, '/users/' + userID + '/tasks')
    const q = query(
      ref,
      where('templateID', '==', templateID),
      orderBy('startDateISO', 'desc')
    )
    
    unsubListener = onSnapshot(q, (querySnapshot) => {
      const temp = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
      temp.sort((a, b) => new Date(b.startDateISO) - new Date(a.startDateISO))
      routineInstances = temp
    })
  }

  onDestroy(() => {
    if (unsubListener) unsubListener()
  })
</script>

<slot routineInstances={routineInstances}>

</slot>

