<script>
  import MslRepeat from 'virtual:icons/material-symbols-light/repeat'
  import { getContext } from 'svelte'

  let { task } = $props()

  const { openTaskPopup, ancestralTree } = getContext('task-popup') // overridden by <TemplateContext>
  const { forgeTemplates } = getContext('uniquely-template')

  let disabled = $state(false)
</script>

{#if task.templateID}
  <button onclick={() => openTaskPopup({ id: task.templateID })}
    class="text-[rgb(0,89,125)]"
  >
    <MslRepeat style="font-size: var(--popup-control)"/>
  </button>
{:else}
  <button {disabled}
    onclick={async () => {
      disabled = true;
      await forgeTemplates($ancestralTree.id, $ancestralTree);
      disabled = false;
      openTaskPopup($ancestralTree);
    }}
  >
    <MslRepeat style="font-size: var(--popup-control)"/>
  </button>
{/if}