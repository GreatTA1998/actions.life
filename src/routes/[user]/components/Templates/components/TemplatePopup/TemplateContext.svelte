<script>
  import { getContext, setContext, onMount } from 'svelte'
  import { user } from '$lib/store'
  import TemplatePopup from './TemplatePopup.svelte'
  import Template from '$lib/db/models/Template.js'
  import { 
    popup, 
    openTemplateEditor, 
    closeTemplateEditor,
    template,
    templates
  } from '/src/routes/[user]/components/Templates/store.js'
  import { collection, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'

  let { children } = $props()

  const app = getContext('app')
  setContext('app', {
    ...app,
    Task: Template,
    openTaskPopup: openTemplateEditor,
    closeTaskPopup: closeTemplateEditor
  })

  onMount(() => {
    const ref = collection(db, '/users/' + $user.uid + '/templates')
    return onSnapshot(ref, async (snap) => {
      templates.set(
        snap.docs.map(doc => ({ ...doc.data(), id: doc.id })
      ))
    })
  })
  
  // TO-DO:
  // 1. ability to create a routine with sub-tasks 
  // 2. ability to build the tree and render it (just copy taskPopup.js for the template popup store.js
  // 3. profit
</script>

<div>
  {@render children()}
  
  {#if $popup && $template}
    <TemplatePopup/>
  {/if}
</div>

