<script>
  import PeriodicInput from './PeriodicInput.svelte'
  import YearlyInput from './YearlyInput.svelte'
  import EditTime from './EditTime.svelte'
  import { user, doodleIcons } from '/src/lib/store'
  import { updateTemplate, deleteTemplate, closeTemplateEditor, templates, editingTemplateId } from '../../store.js'
  import Template from '/src/lib/db/models/Template'
  import { onMount } from 'svelte'
  import { createDebouncedFunction } from '/src/lib/utils/core.js'
  import IconsDisplay from '../IconsDisplay/IconsDisplay.svelte'
  import Icon from '/src/lib/db/models/Icon.js'
  import MonthlyInput from './MonthlyInput.svelte'

  export let template

  let newName = '' 
  let isPopupOpen = false

  $: template = $templates.find(t => t.id === $editingTemplateId)
  $: if (template) {
    console.log('template.rrStr =', template.rrStr)
    init()
  }

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

  function init () {
    isPopupOpen = false
    newName = template.name
  }

  function handleDelete() {
    deleteTemplate({ templateID: template.id })
    isPopupOpen = false
  }

  function setIsPopupOpen({ newVal }) {
    isPopupOpen = newVal
    if (!newVal) {
      closeTemplateEditor()
    }
  }
</script>
<slot {setIsPopupOpen}></slot>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div on:click|self={closeTemplateEditor} class="fullscreen-invisible-modular-popup-layer">
  <div class="detailed-card-popup">
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
        <MonthlyInput {template} />
        <!-- <PeriodicInput {template} maxDays={31} crontabIndex={2} /> -->
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

<style>
  .title-underline-input {
    /* Refer to: https://stackoverflow.com/a/3131082/7812829 */
    background: transparent;
    border: none;
    border-bottom: 1px solid #dbdbdd;
    outline: none;
    font-size: 23px;
    font-weight: 700;
    padding-left: 0px;
    padding-bottom: 6px;
  }

  .detailed-card-popup {
    /* safety */
    max-height: 90vh;

    position: fixed;
    font-size: 14px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 58%;
    overflow-y: auto;
    z-index: 3;
    min-width: 360px;

    height: fit-content;

    padding: 40px 24px 24px;
    border-radius: 24px;
    background-color: white;

    /* border: 1px solid #000; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);*/
    box-shadow: 0px 0px 0px 9999px rgba(0, 0, 0, 0.5);
  }
</style>
