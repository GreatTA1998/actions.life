<script>
  import { currentMode } from '$lib/store'
  import { openTemplateEditor } from '/src/routes/[user]/components/Templates/store.js'
  import PeriodicityEditor from '/src/routes/[user]/components/Templates/components/TemplatePopup/PeriodicityEditor.svelte'
  import { getContext } from 'svelte'

  const { closeTaskPopup } = getContext('app')

  export let taskObject

  let isCreatingRoutine = false

  function toggleCreate () {
    isCreatingRoutine = !isCreatingRoutine
  }

  function redirectToRoutine () {
    currentMode.set('Templates')
    openTemplateEditor(taskObject.templateID)
    closeTaskPopup()
  }
</script>

{#if taskObject.templateID}
  <button on:click={redirectToRoutine} class="action-button material-symbols-outlined">
    autorenew
  </button>

  <u on:click={redirectToRoutine} on:keydown style="cursor: pointer;">Manage routine</u>
{:else}
  <button on:click|stopPropagation={toggleCreate} class="action-button material-symbols-outlined">
    autorenew
  </button>

  {#if isCreatingRoutine}
    <PeriodicityEditor isCreating routine={{ ...taskObject, rrStr: '' }} />
  {/if}
{/if}

<style>
  .action-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 23px;
    color: rgb(20, 20, 20);
    position: relative;
  }
</style> 