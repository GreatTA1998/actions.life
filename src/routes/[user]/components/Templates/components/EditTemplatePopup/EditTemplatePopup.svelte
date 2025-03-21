<script>
  import PeriodicInput from './PeriodicInput.svelte'
  import YearlyInput from './YearlyInput.svelte'
  import EditTime from './EditTime.svelte'
  import { user, doodleIcons } from '/src/lib/store'
  import { updateTemplate, deleteTemplate } from '../../store.js'
  import Template from '/src/lib/db/models/Template'
  import { onMount } from 'svelte'
  import { createDebouncedFunction } from '/src/lib/utils/core.js'
  import IconsDisplay from '../IconsDisplay/IconsDisplay.svelte'
  import Icon from '/src/lib/db/models/Icon.js'
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
        {#if Template.getPeriodFromCrontab(template.crontab) === 'weekly'}
          <PeriodicInput {template} maxDays={7} crontabIndex={4} />
        {:else if Template.getPeriodFromCrontab(template.crontab) === 'monthly'}
          <PeriodicInput {template} maxDays={31} crontabIndex={2} />
        {:else if Template.getPeriodFromCrontab(template.crontab) === 'yearly'}
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
