<script>
  import TemplatePopup from '/src/routes/[user]/components/Templates/components/TemplatePopup/TemplatePopup.svelte'
  import { buildForest, findSubtree } from '$lib/db/tree.ts'
  import { user } from '$lib/store'
  import { onSnapshot, query, collection, where } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import Task from '$lib/db/models/Task.js'
  import Template from '$lib/db/models/Template.js'
  import { setContext, getContext, onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { randomID } from '$lib/utils/core.js'

  let { children } = $props()

  // for the "Restore previously deleted template?" prompt, we need the originating
  // task family tree -- which is owned by <TaskPopupContext>.
  const taskPopup = getContext('taskPopup')

  let templatePopup = $state({
    templates: [],         // root templates (parentID === '')
    template: null,        // currently focused template
    templateTree: null,    // ancestral subtree rooted at the focused template
    openTemplatePopup ({ id }) {
      clickedTemplateID = id
    },
    closeTemplatePopup () {
      clickedTemplateID = ''
    },
    forgeTemplates
  })

  let clickedTemplateID = $state('')

  setContext('templatePopup', templatePopup)

  // always-on: keep the routines list synced
  onMount(() => onSnapshot(
    query(
      collection(db, '/users/' + get(user).uid + '/templates'),
      where('parentID', '==', '')
    ),
    snap => {
      templatePopup.templates = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }))
    }
  ))

  // on click: resolve the template, listen to its tree
  $effect(() => {
    if (!clickedTemplateID) return

    const result = templatePopup.templates.find(T => T.id === clickedTemplateID)
    if (!result) {
      if (confirm('Restore previously deleted template?')) {
        forgeTemplates(clickedTemplateID, taskPopup?.familyTree)
      }
      clickedTemplateID = ''
      return
    }

    templatePopup.template = result

    return onSnapshot(
      query(
        collection(db, `users/${get(user).uid}/templates`),
        where('rootID', '==', result.rootID)
      ),
      snapshot => {
        const results = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
        const [ancestralTree] = buildForest(results)
        templatePopup.templateTree = findSubtree({ id: clickedTemplateID, tree: ancestralTree })
      }
    )
  })

  // children nodes must not have templateIDs, otherwise they'd be able to configure `rrStr` on subtemplates
  async function forgeTemplates (id, taskTree) {
    await helper({ node: taskTree, newID: id, parentID: '', rootID: id })
    await Task.update({ id: taskTree.id, kvChanges: { templateID: id } })
  }

  async function helper ({ node, newID, parentID, rootID }) {
    await Template.create({
      id: newID,
      data: { ...node, parentID } // `rootID` is handled by Template.create()
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

{@render children()}

{#if clickedTemplateID && templatePopup.template}
  <TemplatePopup />
{/if}
