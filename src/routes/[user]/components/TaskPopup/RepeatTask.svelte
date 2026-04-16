<script>
  import MslRepeat from 'virtual:icons/material-symbols-light/repeat'
  import { getContext } from 'svelte'

  const { openTaskPopup, familyTree, forgeTemplates } = getContext('app')

  let { task } = $props()
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
      await forgeTemplates($familyTree.id, $familyTree);
      disabled = false;
      openTaskPopup({ id: $familyTree.id });
    }}
  >
    <MslRepeat style="font-size: var(--popup-control)"/>
  </button>
{/if}