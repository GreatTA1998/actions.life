<script>
  import WeeklyInput from './WeeklyInput.svelte'
  import YearlyInput from './YearlyInput.svelte'
  import EditTime from './EditTime.svelte'
  import PreviewChanges from './PreviewChanges.svelte'
  import { user, doodleIcons } from '/src/lib/store'
  import { updateTemplate, deleteTemplate, closeTemplateEditor, templates, editingTemplateId } from '../../store.js'
  import Template from '/src/lib/db/models/Template'
  import { onMount } from 'svelte'
  import { createDebouncedFunction } from '/src/lib/utils/core.js'
  import IconsDisplay from '../IconsDisplay/IconsDisplay.svelte'
  import Icon from '/src/lib/db/models/Icon.js'
  import MonthlyInput from './MonthlyInput.svelte'
  import Tabs from '/src/lib/components/Tabs.svelte'
  import { parseRecurrenceString } from '../../recurrenceParser.js'
  import RoundButton from '$lib/components/RoundButton.svelte'
  import { deleteFutureInstances, fillTaskInstances } from '$lib/store/templateInstances.js'
  import { DateTime } from 'luxon'

  export let template

  let newName = '' 
  let isPopupOpen = false
  let activeTab = 'weekly'
  let iconsMenu = false
  
  let hasUnsavedChanges = false
  let pendingRRStr = ''
  
  const tabItems = [
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' }
  ]

  $: template = $templates.find(t => t.id === $editingTemplateId)

  $: if (template) {
    console.log('template =', template)
    init()
  }

  function determineRecurrenceType(rrStr) {
    const parsedData = parseRecurrenceString(rrStr)
    activeTab = parsedData.type
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
    determineRecurrenceType(template.rrStr)
    hasUnsavedChanges = false
    pendingRRStr = ''
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
  
  function handleTabChange(event) {
    activeTab = event.detail.tab
  }

  function handleRRuleChange(event) {
    hasUnsavedChanges = true
    pendingRRStr = event.detail.rrStr
  }

  async function handleSave() {
    if (hasUnsavedChanges && pendingRRStr) {
      // determine the previewSpan depneding on if rrSTr is monthly, weekly or yearly
      let previewSpan = 2*7
      if (activeTab === 'monthly') previewSpan = 2*30
      if (activeTab === 'yearly') previewSpan = 2*365

      await Template.update({ 
        userID: $user.uid, 
        id: template.id, 
        updates: { rrStr: pendingRRStr, previewSpan } 
      })

      // regenerate tasks
      // NOTE: potentially dangerous if user spent effort
      // writing notes and putting photos on a future task

      // this await is VERY IMPORTANT, or you'll delete the filled tasks
      await deleteFutureInstances(template, $user.uid)

      fillTaskInstances({ 
        template, 
        startISO: DateTime.now().toFormat('yyyy-MM-dd'), 
        uid: $user.uid 
      })
      hasUnsavedChanges = false
    }
  }
</script>
<slot {setIsPopupOpen}></slot>

<div on:click|self={closeTemplateEditor} on:keydown class="fullscreen-invisible-modular-popup-layer">
  <div class="detailed-card-popup">
    <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center;">
      {#if template.iconURL && activeTab === 'weekly'}
        <div class="icon-container" class:active={iconsMenu} on:click={() => iconsMenu = !iconsMenu} on:keydown>
          <img src={template.iconURL} style="width: 100%; height: 100%; border-radius: 50%;" alt="Task icon" />
        </div>
      {/if}

      <!-- on:input={(e) => debouncedRenameTask(e.target.value)} -->
      <input
        type="text"
        bind:value={newName}
        placeholder="Untitled"
        style="width: 100%; font-size: 24px;"
        class="title-underline-input"
      />
    </div>

    
    {#if activeTab === 'weekly' && iconsMenu}
      <IconsDisplay {template} />
    {/if}

    <div style="display: flex; flex-direction: column; margin-top: 24px;">
      <Tabs tabs={tabItems} bind:activeTab on:tabChange={handleTabChange} />

      {#if activeTab === 'weekly'}
        <WeeklyInput {template} on:rruleChange={handleRRuleChange} />
      {:else if activeTab === 'monthly'}
        <MonthlyInput {template} on:rruleChange={handleRRuleChange} />
      {:else if activeTab === 'yearly'}
        <YearlyInput {template} on:rruleChange={handleRRuleChange} />
      {/if}
    </div>

    <EditTime {template} />

    <PreviewChanges {template} {pendingRRStr} />

    <div class="actions-container">
      {#if hasUnsavedChanges}
        <RoundButton on:click={handleSave} backgroundColor="rgb(0, 89, 125)" textColor="white">
          Save changes
        </RoundButton>
      {/if}

      <div on:click|stopPropagation={handleDelete} on:keydown
        class="material-symbols-outlined delete-button"
      >
        delete
      </div>
    </div>
  </div>
</div>

<style>
  .title-underline-input {
    /* Refer to: https://stackoverflow.com/a/3131082/7812829 */
    background: transparent;
    border: none;
    outline: none;
    font-size: 23px;
    font-weight: 700;
    padding-left: 0px;
  }

  .detailed-card-popup {
    /* safety */
    max-height: 90vh;
    min-width: 360px;

    width: 70%;
 
    position: fixed;
    font-size: 14px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
 
    overflow-y: auto;
    z-index: 3;

    height: fit-content;

    padding: 24px;
    border-radius: 24px;
    background-color: white;

    /* border: 1px solid #000; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);*/
    box-shadow: 0px 0px 0px 9999px rgba(0, 0, 0, 0.5);
  }

  .icon-container {
    position: relative;
    width: 48px;
    height: 48px;
    cursor: pointer;
    transform: scale(1.05);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border-radius: 50%;
    transition: box-shadow 0.2s ease;
  }
  
  .icon-container.active {
    box-shadow: 0 2px 8px rgba(90, 179, 39, 0.5);
  }

  .actions-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
  }

  .delete-button {
    cursor: pointer;
    border-radius: 50%;
    padding: 4px;
  }
</style>