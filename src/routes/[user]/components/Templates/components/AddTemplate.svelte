<script>
  import { user } from '/src/lib/store'
  import { templates } from '../store.js'
  import BasePopup from '$lib/components/BasePopup.svelte'
  import RoundButton from '$lib/components/RoundButton.svelte'
  import { DateTime } from 'luxon'
  import Template from '$lib/db/models/Template.js'
  import { getRandomID } from '/src/lib/utils/core.js'

  export let defaultOrderValue = 1
  export let crontab

  let isPopupOpen = false
  let newTaskName = ''

  const setIsPopupOpen = ({ newVal }) => (isPopupOpen = newVal)

  function handleKeyPress (event) {
    if (event.key === 'Enter' && newTaskName.trim()) {
      createTemplate()
    }
  }

  async function createTemplate () {
    if (!newTaskName.trim()) return
    const newTemplate = {
      name: newTaskName,
      duration: 5,
      orderValue: defaultOrderValue + Math.random() * 0.5,
      crontab: crontab,
      timeZone: DateTime.now().zoneName,
      notes: '',
      notify: '',
      startTime: '',
      lastGeneratedTask: DateTime.now().toFormat('yyyy-MM-dd'),
      iconURL: '',
      tags: ''
    }
    const templateID = getRandomID()
    Template.create({ userID: $user.uid, newTemplate, templateID })
    $templates = [
      ...$templates,
      { ...newTemplate, id: templateID, userID: $user.uid }
    ]
    newTaskName = ''
    isPopupOpen = false
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div style="font-size: 24px; margin-bottom: 12px; cursor: pointer;">
  <span
    style="cursor:pointer"
    on:click={() => setIsPopupOpen({ newVal: true })}
  >
    {Template.getPeriodFromCrontab(crontab).toUpperCase()}</span
  >
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <span
    on:click={() => setIsPopupOpen({ newVal: true })}
    class="add-reusable-task-button"
  >
    <span class="material-icons">add_circle_outline</span>
  </span>

  {#if isPopupOpen}
    <BasePopup on:click-outside={() => isPopupOpen = false}>
      <!-- svelte-ignore a11y-autofocus -->
      <input
        type="text"
        bind:value={newTaskName}
        on:keypress={handleKeyPress}
        placeholder="name"
        style="margin-left: 12px; width: 100%; font-size: 24px;"
        class="title-underline-input"
        autofocus
      />

      <div style="display: flex; justify-content: space-between; width: 100%; margin-top: 16px;">
        <RoundButton on:click={createTemplate}
          isDisabled={!newTaskName.trim()}
          backgroundColor="rgb(0, 89, 125)"
          textColor="white"
        >
          Create template
        </RoundButton>
      </div>
    </BasePopup>
  {/if}
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

  .add-reusable-task-button {
    position: relative;
    top: 4px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    transition: opacity 0.2s ease;
  }

  .add-reusable-task-button:hover {
    opacity: 0.7;
  }

  .material-icons {
    font-size: 24px;
    color: #8e8e93;
  }
</style>
