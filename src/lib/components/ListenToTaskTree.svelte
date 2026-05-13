<script>
  import { buildForest, findSubtree } from '$lib/db/tree.ts'
  import { get } from 'svelte/store'
  import { user } from '$lib/store'
  import { onSnapshot, query, collection, where } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { getContext } from 'svelte'

  let { rootID, id, children } = $props()
  const { ancestralTree } = getContext('task-popup')

  $effect(
    () => listenToAncestralTree({ rootID, id })
  )

  function listenToAncestralTree ({ rootID, id }) {        
    return onSnapshot(
      query(
        collection(db, `/users/${get(user).uid}/tasks`),
        where('rootID', '==', rootID)
      ),
      snapshot => {
        const tasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
        const [tree] = buildForest(tasks)
        ancestralTree.set(findSubtree({ id, tree }))
      }
    )
  }
</script>

{@render children(ancestralTree)}