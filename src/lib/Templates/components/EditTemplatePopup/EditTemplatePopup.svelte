<script>
  import PeriodicInput from '$lib/Templates/components/EditTemplatePopup/PeriodicInput.svelte'
  import YearlyInput from '$lib/Templates/components/EditTemplatePopup/YearlyInput.svelte'
  import EditTime from '$lib/Templates/components/EditTemplatePopup/EditTime.svelte'
  import { user, doodleIcons } from '/src/store'
  import { updateTemplate, deleteTemplate } from '/src/lib/Templates/store.js'
  import Templates from '/src/db/models/Templates/index.js'
  import { onMount } from 'svelte'
  import { createDebouncedFunction } from '/src/utils/core.js'
  import IconsDisplay from '../IconsDisplay/IconsDisplay.svelte'
  import Icon from '/src/db/Icon.js'
  export let template
  let isPopupOpen = false
  let newName = template.name

  const debouncedRenameTask = createDebouncedFunction(
    (newVal) =>
      updateTemplate({
        templateID: template.id,
        keyValueChanges: { name: newVal },
        oldTemplate: template
      }),
    800
  )

  onMount(async () => {
    $doodleIcons = await Icon.getAvailable($user.uid)
  })

  function handleDelete() {
    deleteTemplate({ templateID: template.id })
    isPopupOpen = false
  }

  function setIsPopupOpen({ newVal }) {
    isPopupOpen = newVal
  }
</script>
<slot {setIsPopupOpen}></slot>

{#if isPopupOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="fullscreen-invisible-modular-popup-layer"
    on:click|self={() => (isPopupOpen = false)}
  >
    <div class="detailed-card-popup">
      <button class="close-button" on:click={() => (isPopupOpen = false)}>
        <span class="close-icon">×</span>
      </button>
      <input
        type="text"
        bind:value={newName}
        on:input={(e) => debouncedRenameTask(e.target.value)}
        placeholder="Untitled"
        style="width: 100%; font-size: 24px;"
        class="title-underline-input"
      />

      <div style="display: flex; align-items: center; margin-top: 24px;">
        {#if Templates.getPeriodFromCrontab(template.crontab) === 'weekly'}
          <PeriodicInput {template} maxDays={7} crontabIndex={4} />
        {:else if Templates.getPeriodFromCrontab(template.crontab) === 'monthly'}
          <PeriodicInput {template} maxDays={31} crontabIndex={2} />
        {:else if Templates.getPeriodFromCrontab(template.crontab) === 'yearly'}
          <YearlyInput {template} />
        {/if}

        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span on:click|stopPropagation={handleDelete}
          class="material-symbols-outlined"
          style="cursor: pointer; margin-left: auto; right: 0px; border: 1px solid grey; border-radius: 24px; padding: 4px;"
        >
          delete
        </span>
      </div>

      <EditTime {template} />

      <IconsDisplay {template} />
    </div>
  </div>
{/if}

<style src="./EditTemplatePopup.css"></style>
