<script>
  import PeriodicityEditor from '/src/routes/[user]/components/Templates/components/TemplatePopup/PeriodicityEditor.svelte'
  import MslRepeat from 'virtual:icons/material-symbols-light/repeat'
  import { user } from '$lib/store'
  import { getContext } from 'svelte'

  const { openTaskPopup } = getContext('app')

  let { task, onToggleTemplateEditor, isTemplateEditorOpen = false } = $props()
  let isCreatingRoutine = $state(false)

  function toggleCreate (e) {
    e.stopPropagation()
    isCreatingRoutine = !isCreatingRoutine
  }

  function toggleTemplateEditor (e) {
    e.stopPropagation()

    openTaskPopup(task.templateID)
    // onToggleTemplateEditor?.() // handle creation edge case
  }
</script>

{#if task.templateID}
  <button onclick={toggleTemplateEditor} 
    class={[
      'text-[rgb(0,89,125)] rounded flex',
      isTemplateEditorOpen && 'bg-[rgba(0, 89, 125, 0.1)]'
    ]}
  >
    <MslRepeat style="font-size: var(--popup-control)"/>
  </button>
{:else}
  <button onclick={toggleCreate} 
    class={[
      'text-[rgb(20,20,20)] rounded flex',
      $user.uid === 'demo-user' && 'text-gray-300 cursor-default'
    ]}
    disabled={$user.uid === 'demo-user'}
  >
    <MslRepeat style="font-size: var(--popup-control)"/>
  </button>

  {#if isCreatingRoutine}
    <PeriodicityEditor isCreating routine={{ ...task, rrStr: '' }} />
  {/if}
{/if}