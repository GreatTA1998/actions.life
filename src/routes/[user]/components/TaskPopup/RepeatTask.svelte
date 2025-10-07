<script>
  import { currentMode } from '$lib/store'
  import { openTemplateEditor } from '/src/routes/[user]/components/Templates/store.js'
  import PeriodicityEditor from '/src/routes/[user]/components/Templates/components/TemplatePopup/PeriodicityEditor.svelte'
  import { getContext } from 'svelte'

  const { closeTaskPopup, user } = getContext('app')
  let { taskObject } = $props()
  let isCreatingRoutine = $state(false)

  function toggleCreate (e) {
    e.stopPropagation()
    isCreatingRoutine = !isCreatingRoutine
  }

  function redirectToRoutine () {
    currentMode.set('Templates')
    openTemplateEditor(taskObject.templateID)
    closeTaskPopup()
  }
</script>

{#if taskObject.templateID}
  <button onclick={redirectToRoutine} class="my-btn material-symbols-outlined">
    repeat
  </button> 

  <u onclick={redirectToRoutine} style="cursor: pointer;">Manage routine</u>
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

  .greyed-out {
    color: rgb(200, 200, 200);
    cursor: default;
  }
</style> 