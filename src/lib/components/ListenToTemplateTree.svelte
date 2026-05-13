<script>
  import { buildForest, findSubtree } from '$lib/db/tree.ts'
  import { query, where, onSnapshot, collection } from 'firebase/firestore'
  import { getContext } from 'svelte'
  import { user } from '$lib/store'
  import { db } from '$lib/db/init.js'

  let { id, children } = $props()

  const { templatesByID, templateTree, forgeTemplates } = getContext('uniquely-template')
  const { ancestralTree } = getContext('task-popup') // bad name I know...but refers to the TaskPopup's ancestral tree

  $effect(
    () => listenToAncestralTree(id)
  )

  function listenToAncestralTree (id) {
    const result = $templatesByID.get(id)
    if (!result) {
      if (confirm('Restore previously deleted template?')) {
        forgeTemplates(id, $ancestralTree)
      }
      return
    }

    return onSnapshot(
      query(
        collection(db, `users/${$user.uid}/templates`),
        where('rootID', '==', result.rootID)
      ),
      snap => {
        const [tree] = buildForest(snap.docs.map(d => ({ ...d.data(), id: d.id })))
        templateTree.set(findSubtree({ id, tree }))
      }
    )
  }
</script>

{@render children()}