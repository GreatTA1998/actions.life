<script>
  import { buildForest, findSubtree } from '$lib/db/tree.ts'
  import { user } from '$lib/store'
  import TemplatePopup from './TemplatePopup.svelte'
  import Template from '$lib/db/models/Template.js'
  import { collection, onSnapshot, query, where } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { writable, get } from 'svelte/store'
  import { getContext, setContext, onMount } from 'svelte'

  let { children } = $props()

  const clickedTemplateID = writable('')
  const popup = writable(false)
  const template = writable(null)
  const templates = writable([])
  const templateTree = writable({ children: [] })  

  const app = getContext('app')
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
    templateTree
  })

  onMount(() => {
    const ref = collection(db, '/users/' + $user.uid + '/templates')
    return onSnapshot(ref, async (snap) => {
      templates.set(
        snap.docs.map(doc => ({ ...doc.data(), id: doc.id })
      ))
    })
  })

  $effect(() => {
    if ($clickedTemplateID === '') return

    const found = $templates.find(T => T.id === $clickedTemplateID)
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
  {@render children()}
  
  {#if $popup && $template}
    <TemplatePopup/>
  {/if}
</div>

