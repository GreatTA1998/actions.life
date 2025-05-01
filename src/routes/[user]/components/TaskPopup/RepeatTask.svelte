<script>
  import PeriodicityInputs from '../Templates/components/TemplatePopup/PeriodicityInputs.svelte';
  import RoundButton from '$lib/components/RoundButton.svelte';
  import Template from '$lib/db/models/Template.js'
  import { currentMode, closeTaskPopup } from '$lib/store'
  import { openTemplateEditor } from '/src/routes/[user]/components/Templates/store.js'

  export let taskObject

  let isCreatingRoutine = false
  let pendingRRStr = ''

  $: console.log("pendingRRStr =", pendingRRStr)

  function toggleCreate () {
    isCreatingRoutine = !isCreatingRoutine
  }

  function redirectToRoutine () {
    currentMode.set('Templates')
    openTemplateEditor(taskObject.templateID)
    closeTaskPopup()
  }

  function createRoutine () {
    console.log("create routine")
    Template.create({
      newTemplate: {
        ...taskObject,
        rrStr: pendingRRStr
      },
      id: taskObject.id
    })
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
    <PeriodicityInputs initialRRStr="" on:update-rr={e => pendingRRStr = e.detail} />

    {#if pendingRRStr}
      <RoundButton on:click={createRoutine} backgroundColor="rgb(0, 89, 125)" textColor="white">
        Apply changes
      </RoundButton>
    {/if}
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