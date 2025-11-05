<script>
  import PeriodicityEditor from '/src/routes/[user]/components/Templates/components/TemplatePopup/PeriodicityEditor.svelte'
  import { getContext } from 'svelte'

  const { user } = getContext('app')
  let { taskObject, onToggleTemplateEditor, isTemplateEditorOpen = false } = $props()
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

{#if taskObject.templateID}
  <button onclick={toggleTemplateEditor} class="my-btn material-symbols-outlined" class:active={isTemplateEditorOpen}>
    repeat
  </button>
{:else}
  <button onclick={toggleCreate} class="my-btn material-symbols-outlined" 
    class:greyed-out={$user.uid === 'demo-user'} disabled={$user.uid === 'demo-user'}
  >
    repeat
  </button>

  {#if isCreatingRoutine}
    <PeriodicityEditor isCreating routine={{ ...taskObject, rrStr: '' }} />
  {/if}
{/if}

<style>
  .my-btn {
    color: rgb(20, 20, 20);
  }

  .my-btn.active {
    color: rgb(0, 89, 125);
    background: rgba(0, 89, 125, 0.1);
  }

  .greyed-out {
    color: rgb(200, 200, 200);
    cursor: default;
  }
</style> 