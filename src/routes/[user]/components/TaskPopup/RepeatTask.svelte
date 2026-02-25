<script>
  import PeriodicityEditor from '/src/routes/[user]/components/Templates/components/TemplatePopup/PeriodicityEditor.svelte'
  import MslRepeat from 'virtual:icons/material-symbols-light/repeat'
  import { user } from '$lib/store'
  import { getContext } from 'svelte'

  const { openTaskPopup } = getContext('app')

  let { task } = $props()
  
  let isCreatingRoutine = $state(false)

  function toggleCreate (e) {
    e.stopPropagation()
    isCreatingRoutine = !isCreatingRoutine
  }
</script>

{#if task.templateID}
  <button
    onclick={() => openTaskPopup({ id: task.templateID })}
    class={['text-[rgb(0,89,125)] rounded flex']}
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