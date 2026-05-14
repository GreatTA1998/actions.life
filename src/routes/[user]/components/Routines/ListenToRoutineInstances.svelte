<script>
  import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { user } from '$lib/store'

  let { 
    templateID = '', 
    children = () => {}
  } = $props()

  let routineInstances = $state(null)
  
  $effect(
    () => onSnapshot(
      query(
        collection(db, '/users/' + $user.uid + '/tasks'),
        where('templateID', '==', templateID),
        orderBy('startDateISO', 'desc')
      ),
      querySnapshot => {
        const temp = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
        temp.sort((a, b) => new Date(b.startDateISO) - new Date(a.startDateISO))
        routineInstances = temp
      }
    ) 
  )
</script>

{#if routineInstances}
  {@render children(routineInstances)}
{/if}

