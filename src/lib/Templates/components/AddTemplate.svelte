<script>
  import { user } from '/src/store'
  import { templates } from '../store.js'
  import RoundButton from '$lib/Reusable/RoundButton.svelte'
  import { DateTime } from 'luxon'
  import Template from '/src/db/models/Template'
  import { getRandomID } from '/src/utils/core.js'
  export let defaultOrderValue = 1
  export let crontab
  let isPopupOpen = false
  let newTaskName = ''

  const setIsPopupOpen = ({ newVal }) => (isPopupOpen = newVal)

  function handleKeyPress(event) {
    if (event.key === 'Enter' && newTaskName.trim()) {
      createTemplate()
    }
  }

  async function createTemplate() {
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
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="fullscreen-invisible-modular-popup-layer"
      on:click|self={() => (isPopupOpen = false)}
    >
      <div class="detailed-card-popup">
        <button class="close-button" on:click={() => (isPopupOpen = false)}>
          <span class="close-icon">×</span>
        </button>
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

        <div
          style="display: flex; justify-content: space-between; width: 100%;
        margin-top: 16px;"
        >
          <RoundButton
            isDisabled={!newTaskName.trim()}
            on:click={createTemplate}
            backgroundColor="rgb(0, 89, 125)"
            textColor="white"
          >
            Create template
          </RoundButton>
        </div>
      </div>
    </div>
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

  .detailed-card-popup {
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

    padding: 24px;
    border-radius: 24px;
    background-color: white;

    /*    border: 1px solid #000; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);*/
    box-shadow: 0px 0px 0px 9999px rgba(0, 0, 0, 0.5);
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

  .close-button {
    position: absolute;
    top: 10px;
    right: 20px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.1);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease;
  }

  .close-button:hover {
    background-color: rgba(0, 0, 0, 0.2);
  }

  .close-icon {
    font-size: 18px;
    color: #333;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    margin-top: -2px;
  }
</style>
