<script lang="ts">
  import { setContext, onMount } from 'svelte'
  import { 
    user, tasksCache, 
    clickedTaskID, closeTaskPopup, familyTree, openTaskPopup,
    initialDataReady
  } from '$lib/store'
  import Task from '$lib/db/models/Task.js'
  import User from '$lib/db/models/User.js'
  import Template from '$lib/db/models/Template.js'
  import Icon from '$lib/db/models/Icon.js'
  import Message from '$lib/db/models/Message.js'
  import GCalAccount from '$lib/db/models/GCalAccount.js'
  import { trackWidth, trackHeight } from '$lib/utils/svelteActions.js'
  import { writable, derived } from 'svelte/store'
  import { buildForest, findSubtree } from '$lib/db/tree.ts'
  import type { Tree } from '$lib/db/tree.ts'
  import { collection, onSnapshot, query, where } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { randomID } from '$lib/utils/core.js'

  let { children } = $props()

  let dimensions = $state({
    width: 0,
    height: 0,
    appDiv: null
  })

  const treesByDate = writable({})

  const clickedTemplateID = writable('')
  const templates = writable<any[]>([])
  const templatesByID = derived(templates, $t => new Map($t.map(x => [x.id, x])))
  const routines = derived(templates, $t => $t.filter(x => x.parentID === ''))
  const template = derived([templatesByID, clickedTemplateID], ([$byID, $id]) => $byID.get($id))
  const templateTree = writable({ children: [] })

  $effect(() => {
    if (Object.keys($treesByDate).length > 0) {
      initialDataReady.set(true)
    }
  })

  setContext('dimensions', dimensions)

  setContext('app', {
    User, 
    Task, 
    Template,
    Icon,
    Message,
    GCalAccount,
    tasksCache,
    clickedTaskID,
    familyTree,
    openTaskPopup,
    closeTaskPopup,

    treesByDate,
    trees: writable(null),
    treesByID: writable({}),

    clickedTemplateID,
    template,
    templates,
    templatesByID,
    routines,
    templateTree,
    forgeTemplates
  })

  onMount(() => onSnapshot(
    collection(db, `users/${$user.uid}/templates`),
    snap => templates.set(snap.docs.map(d => ({ ...d.data(), id: d.id })))
  ))

  $effect(() => {
    const id = $clickedTemplateID
    if (!id) return

    const result = $templatesByID.get(id)
    if (!result) {
      if (confirm('Restore previously deleted template?')) {
        forgeTemplates(id, $familyTree)
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
  })

  // children nodes must not have templateIDs, otherwise they'd be able to configure `rrStr` on subtemplates
  async function forgeTemplates (id: string, taskTree: Tree) {
    await helper({ 
      node: taskTree, 
      newID: id,
      parentID: '', 
      rootID: id
    })
    await Task.update({ id: taskTree.id, kvChanges: {
      templateID: id
    }})
  }

  async function helper ({ node, newID, parentID, rootID }) {
    await Template.create({ 
      id: newID, 
      data: { ...node, parentID } // `rootID` will be handled by Template.create() 
    })

    await Promise.all(
      node.children.map(child => helper({
        node: child, 
        newID: randomID(), 
        parentID: newID, 
        rootID
      }))
    )
  }
</script>

<div 
  bind:this={dimensions.appDiv} 
  use:trackWidth={w => dimensions.width = w}
  use:trackHeight={h => dimensions.height = h}
  class="z-0 relative h-full"
>
  {@render children()}
</div>