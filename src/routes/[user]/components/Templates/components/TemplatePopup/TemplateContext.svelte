<script lang="ts">
  /**
   * Hijacks openTaskPopup() and popoverInput() to act on templates, instead of tasks. 
   * Implicit, dangerous code, but achieves medium-term re-usability and correctness (re-using battle-tested code)
  */
  import TemplatePopup from './TemplatePopup.svelte'
  import Template from '$lib/db/models/Template.js'
  import ListenToTemplateTree from '$lib/components/ListenToTemplateTree.svelte'
  import Task from '$lib/db/models/Task.js'
  import { writable, derived } from 'svelte/store'
  import { getContext, setContext } from 'svelte'
  import PopoverInputContext from '$lib/components/PopoverInputContext.svelte'
  import type { Tree } from '$lib/db/tree.ts'
  import { randomID } from '$lib/utils/core.js'

  let { children } = $props()

  const { templates } = getContext('app')

  const popup = writable(false)

  const clickedTemplateID = writable('')
  const templatesByID = derived(templates, $t => new Map($t.map(x => [x.id, x])))
  const template = derived([templatesByID, clickedTemplateID], ([$byID, $id]) => $byID.get($id))
  const routines = derived(templates, $t => $t.filter(x => x.parentID === ''))
  const templateTree = writable({ children: [] })

  const app = getContext('app')
  const taskPopupContext = getContext('task-popup')

  setContext('app', {
    ...app,
    popup,
    Task: Template,
  })

  setContext('task-popup', {
    ...taskPopupContext,
    openTaskPopup ({ id }) {
      clickedTemplateID.set(id)
      popup.set(true)
    },
    closeTaskPopup: () => { 
      popup.set(false)
      clickedTemplateID.set('')
    },
  })

  setContext('uniquely-template', {
    forgeTemplates,
    routines, 
    templateTree,
    template,
    templatesByID
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

<PopoverInputContext>
  {@render children()}
  
  {#if $popup && $clickedTemplateID}
    <ListenToTemplateTree id={$clickedTemplateID}>
      {#if $templateTree && $template}
        <TemplatePopup />
      {/if}
    </ListenToTemplateTree>
  {/if}
</PopoverInputContext>


