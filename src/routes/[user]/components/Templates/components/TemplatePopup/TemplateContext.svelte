<script lang="ts">
  import { buildForest, findSubtree } from '$lib/db/tree.ts'
  import { user } from '$lib/store'
  import TemplatePopup from './TemplatePopup.svelte'
  import Template from '$lib/db/models/Template.js'
  import { collection, onSnapshot, query, where } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { writable, get } from 'svelte/store'
  import { getContext, setContext, onMount } from 'svelte'
  import PopoverInputContext from '$lib/components/PopoverInputContext.svelte'
  import Task from '$lib/db/models/Task.js'
  import { randomID } from '$lib/utils/core.js'
  import type { Tree } from '$lib/db/tree'

  let { children } = $props()

  const clickedTemplateID = writable('')
  const popup = writable(false)
  const template = writable(null)
  const templates = writable([])
  const templateTree = writable({ children: [] })  

  const app = getContext('app')
  const { familyTree } = getContext('app')

  setContext('app', {
    ...app,
    Task: Template,
    openTaskPopup ({ id }) {
      clickedTemplateID.set(id)
      popup.set(true)
    },
    closeTaskPopup: () => { 
      popup.set(false)
      clickedTemplateID.set('')
    },
    clickedTemplateID,
    popup, 
    template, 
    templates, 
    templateTree,
    forgeTemplates
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

  onMount(() => onSnapshot(
    query(
      collection(db, '/users/' + $user.uid + '/templates'), 
      where('parentID', '==', '')
    ), 
    async (snap) => {
      templates.set(
        snap.docs.map(doc => ({ ...doc.data(), id: doc.id })
      ))
    }
  ))

  $effect(() => {
    if ($clickedTemplateID === '') return

    const found = $templates.find(T => T.id === $clickedTemplateID)
    if (!found && confirm ('Restore deleted template?')) { // restore the template
      forgeTemplates(
        $clickedTemplateID,
        $familyTree
      )
      return
    }

    template.set(found)

    return onSnapshot(
      query(
        collection(db, `users/${get(user).uid}/templates`),
        where('rootID', '==', found.rootID)
      ),
      snapshot => {
        const results = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
        const [ancestralTree] = buildForest(results)
        const family = findSubtree({ id: $clickedTemplateID, tree: ancestralTree })
        templateTree.set(family)
      }
    )
  })
</script>

<div>
  <PopoverInputContext>
    {@render children()}
    
    {#if $popup && $template}
      <TemplatePopup/>
    {/if}
  </PopoverInputContext>
</div>

