<script>
  /**
   * Hijacks openTaskPopup() and popoverInput() to act on templates, instead of tasks. 
   * Implicit, dangerous code, but achieves medium-term re-usability and correctness (re-using battle-tested code)
  */
  import TemplatePopup from './TemplatePopup.svelte'
  import Template from '$lib/db/models/Template.js'
  import { writable } from 'svelte/store'
  import { getContext, setContext } from 'svelte'
  import PopoverInputContext from '$lib/components/PopoverInputContext.svelte'

  let { children } = $props()

  const popup = writable(false)

  const app = getContext('app')
  const { 
    clickedTemplateID, 
    template, 
  } = getContext('app')

  setContext('app', {
    ...app,
    popup,
    Task: Template,
    openTaskPopup ({ id }) {
      clickedTemplateID.set(id)
      popup.set(true)
    },
    closeTaskPopup: () => { 
      popup.set(false)
      clickedTemplateID.set('')
    }
  })
</script>

<PopoverInputContext>
  {@render children()}
  
  {#if $popup && $template}
    <TemplatePopup/>
  {/if}
</PopoverInputContext>


