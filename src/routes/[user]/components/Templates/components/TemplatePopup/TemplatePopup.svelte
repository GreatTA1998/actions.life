<script>
  import WeeklyInput from './WeeklyInput.svelte'
  import YearlyInput from './YearlyInput.svelte'
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
  import { inputStates, monthlyInputSourceOfTruth, overallSourceOfTruth } from './store.js'
  
  export let template

  let pendingRRStr = ''
  let newName = '' 
  let isPopupOpen = false
  let activeTab = 'weekly'
  let iconsMenu = false
  
  const tabItems = [
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' }
  ]

  $: template = $templates.find(t => t.id === $editingTemplateId)
  $: if (template) {
    init()
  }

  // dangerous but works. note: must be ordered before `handleNewInput()`
  $: if (activeTab === 'monthly') {
    overallSourceOfTruth.set($monthlyInputSourceOfTruth)
  }
  $: handleNewInput($inputStates, $overallSourceOfTruth)
  $: hasUnsavedChanges = template.rrStr !== pendingRRStr
  
  onMount(async () => {
    $doodleIcons = await Icon.getAvailable($user.uid) 
  })

  function handleNewInput () {
    pendingRRStr = $inputStates[$overallSourceOfTruth]
  }

  function getSourceOfTruth (rrStr) {
    if (!rrStr) {
      return {
        monthlyInput: 'monthlyTypeI',
        overall: 'weekly'
      }
    }

    const rrLower = rrStr.toLowerCase()
    let overall = 'weekly'
    let monthlyInput = 'monthlyTypeI'

    if (rrLower.includes('freq=monthly') || (!rrLower.includes('freq=') && rrLower.includes('bymonthday'))) {
      overall = 'monthly'
    } else if (rrLower.includes('freq=yearly') || (!rrLower.includes('freq=') && rrLower.includes('bymonth'))) {
      overall = 'yearly'
    }

    if (overall === 'monthly') {
      if (rrLower.includes('byday') && (rrLower.includes('bysetpos') || rrLower.includes('byweekno'))) {
        monthlyInput = 'monthlyTypeII'
      } else {
        monthlyInput = 'monthlyTypeI'
      }
    }

    return {
      monthlyInput, 
      overall
    }
  }

  function init () {
    isPopupOpen = false
    newName = template.name
    activeTab = determineRecurrenceType(template.rrStr)

    const { monthlyInput, overall } = getSourceOfTruth(template.rrStr)
    monthlyInputSourceOfTruth.set(monthlyInput)
    overallSourceOfTruth.set(overall)

    inputStates.update(states => ({ ...states, [$overallSourceOfTruth]: template.rrStr }))
  }

  function handleTabChange (e) {
    activeTab = e.detail.tab

    if (activeTab === 'weekly') {
      overallSourceOfTruth.set('weekly')
    } 
    else if (activeTab === 'monthly') {
      overallSourceOfTruth.set($monthlyInputSourceOfTruth)
    } 
    else if (activeTab === 'yearly') {
      overallSourceOfTruth.set('yearly')
    }
  }

  function determineRecurrenceType (rrStr) {
    const parsedData = parseRecurrenceString(rrStr)
    return parsedData.type
  }

  function handleDelete () {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplate({ templateID: template.id })
      isPopupOpen = false
    }
  }

  function setIsPopupOpen ({ newVal }) {
    isPopupOpen = newVal
    if (!newVal) {
      closeTemplateEditor()
    }
  }

  async function handleSave () {
    if (hasUnsavedChanges) {
      let previewSpan = 2*7
      if (activeTab === 'monthly') previewSpan = 2*30
      if (activeTab === 'yearly') previewSpan = 2*365

      await Template.update({ 
        userID: $user.uid, 
        id: template.id, 
        updates: { rrStr: pendingRRStr, previewSpan } 
      })

      // this await is VERY IMPORTANT, or you'll delete the filled tasks
      // NOTE: potentially dangerous if user spent effort writing notes and putting photos on a future task
      await deleteFutureInstances(template, $user.uid)

      fillTaskInstances({ 
        template, 
        startISO: DateTime.now().toFormat('yyyy-MM-dd'), 
        uid: $user.uid 
      })

      hasUnsavedChanges = false
    }
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
</script>

<slot {setIsPopupOpen}>

</slot>

<div on:click|self={closeTemplateEditor} on:keydown class="fullscreen-invisible-modular-popup-layer">
  <div class="detailed-card-popup">
    <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center;">
      {#if template.iconURL && activeTab === 'weekly'}
        <div class="icon-container" class:active={iconsMenu} on:click={() => iconsMenu = !iconsMenu} on:keydown>
          <img src={template.iconURL} style="width: 100%; height: 100%; border-radius: 50%;" alt="Task icon" />
        </div>
      {/if}

      <!-- on:input={(e) => debouncedRenameTask(e.target.value)} -->
      <input bind:value={newName} type="text" placeholder="Untitled" style="width: 100%; font-size: 24px;" class="title-underline-input" />
    </div>
    
    {#if activeTab === 'weekly' && iconsMenu}
      <IconsDisplay {template} />
    {/if}

    <div style="display: flex; flex-direction: column; margin-top: 24px;">
      <Tabs tabs={tabItems} bind:activeTab on:tabChange={handleTabChange} />

      {#if activeTab === 'weekly'}
        <WeeklyInput />
      {:else if activeTab === 'monthly'}
        <MonthlyInput />
      {:else if activeTab === 'yearly'}
        <YearlyInput {template} />
      {/if}
    </div>

    <!-- <EditTime {template} /> -->

    <div class="actions-container">
      {#if hasUnsavedChanges}
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <PreviewChanges {template} {pendingRRStr} />

          <RoundButton on:click={handleSave} backgroundColor="rgb(0, 89, 125)" textColor="white">
            Update routine & propogate to future tasks 
          </RoundButton>
        </div>
      {/if}
    </div>

    <button on:click|stopPropagation={handleDelete} class="material-symbols-outlined delete-button">
      delete
    </button>
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
    height: 90vh;
    overflow-y: auto;
 
    position: fixed;
    z-index: 3;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    font-size: 14px;
    padding: 24px;
    border-radius: 24px;
    background-color: white;

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
    position: absolute;
    bottom: 16px;
    right: 16px;
    border-radius: 50%;
    padding: 4px;
  }
</style>