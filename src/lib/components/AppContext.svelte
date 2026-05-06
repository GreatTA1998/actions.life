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
  import { writable } from 'svelte/store'
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
  const template = writable(null)
  const templates = writable([])
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
    templateTree,
    forgeTemplates
  })

  onMount(() => onSnapshot(
    collection(db, '/users/' + $user.uid + '/templates'),
    async (snap) => {
      templates.set(
        snap.docs
          .map(doc => ({ ...doc.data(), id: doc.id }))
          .filter(isTopLevelTemplate)
      )
    }
  ))

  function isTopLevelTemplate (template) {
    if (Object.prototype.hasOwnProperty.call(template, 'parentID')) {
      return template.parentID === ''
    }
    return true
  }

  $effect(() => {
    if ($clickedTemplateID === '') return

    const result = $templates.find(T => T.id === $clickedTemplateID)
    if (!result) { 
      if (confirm('Restore previously deleted template?')) {
        forgeTemplates(
          $clickedTemplateID,
          $familyTree
        )
      }
      return
    }

    template.set(result)

    return onSnapshot(
      query(
        collection(db, `users/${$user.uid}/templates`),
        where('rootID', '==', result.rootID)
      ),
      snapshot => {
        const results = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
        const [ancestralTree] = buildForest(results)
        const family = findSubtree({ id: $clickedTemplateID, tree: ancestralTree })
        templateTree.set(family)
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