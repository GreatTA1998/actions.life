<script>
  import PeriodicityEditor from '/src/routes/[user]/components/Templates/components/TemplatePopup/PeriodicityEditor.svelte'
  import MslRepeat from 'virtual:icons/material-symbols-light/repeat'
  import { getContext } from 'svelte'

  const { user } = getContext('app')
  let { task, onToggleTemplateEditor, isTemplateEditorOpen = false } = $props()
  let isCreatingRoutine = $state(false)

  function toggleCreate (e) {
    e.stopPropagation()
    isCreatingRoutine = !isCreatingRoutine
  }

  function toggleTemplateEditor (e) {
    e.stopPropagation()
    onToggleTemplateEditor?.()
  }
</script>

{#if task.templateID}
  <button onclick={toggleTemplateEditor} class="my-btn flexbox" style="color: rgb(0, 89, 125);" class:active={isTemplateEditorOpen}>
    <MslRepeat style="font-size: var(--popup-control);"/>
  </button>
{:else}
  <button onclick={toggleCreate} class="my-btn flexbox" 
    class:greyed-out={$user.uid === 'demo-user'} disabled={$user.uid === 'demo-user'}
  >
    <MslRepeat style="font-size: var(--popup-control);"/>
  </button>

  {#if isCreatingRoutine}
    <PeriodicityEditor isCreating routine={{ ...task, rrStr: '' }} />
  {/if}
{/if}

<style>
  .my-btn {
    color: rgb(20, 20, 20);
    border-radius: 4px;
  }

  .my-btn.active {
    background: rgba(0, 89, 125, 0.1);
  }

  .greyed-out {
    color: rgb(200, 200, 200);
    cursor: default;
  }
</style> 