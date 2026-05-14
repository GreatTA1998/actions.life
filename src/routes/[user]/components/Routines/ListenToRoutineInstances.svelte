<script>
  import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { onMount } from 'svelte'

  export let templateID = ''
  export let userID = ''

  let routineInstances = null
  
  onMount(() => onSnapshot(
    query(
      collection(db, '/users/' + userID + '/tasks'),
      where('templateID', '==', templateID),
      orderBy('startDateISO', 'desc')
    ),
    querySnapshot => {
      const temp = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
      temp.sort((a, b) => new Date(b.startDateISO) - new Date(a.startDateISO))
      routineInstances = temp
    })
  )
</script>

<slot {routineInstances}>

</slot>

