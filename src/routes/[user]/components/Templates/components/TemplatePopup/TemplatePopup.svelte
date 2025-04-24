<script>
  import BasePopup from './BasePopup.svelte'
  import PeriodicityInputs from './PeriodicityInputs.svelte'
  import PreviewChanges from './PreviewChanges.svelte'
  import IconsDisplay from '../IconsDisplay/IconsDisplay.svelte'
  import RoundButton from '$lib/components/RoundButton.svelte'

  import Template from '$lib/db/models/Template.js'
  import { 
    pendingRRStr, deletingTasks, addingTasks, getPreviewSpan,
    activeTab, hasUnsavedChanges, resetPreviewStates
  } from './store.js'
  import { template, closeTemplateEditor } from '../../store.js'
  import { user } from '$lib/store'

  import { createDebouncedFunction } from '$lib/utils/core.js'

  let iconsMenu = false
  
  async function handleSave () {
    if ($hasUnsavedChanges) {
      for (const task of $deletingTasks) {
        console.log('task to delete =', task)
      }
      for (const task of $addingTasks) {
        console.log('task to add =', task)
      }
      Template.update({ userID: $user.uid, id: $template.id, updates: { 
        rrStr: $pendingRRStr, 
        previewSpan: getPreviewSpan($pendingRRStr)
      }})
      resetPreviewStates()
    }
  }

  function handleDelete () {
    if (confirm('Are you sure you want to delete this template?')) {
      // deleteTemplate({ templateID: $template.id })
      closeTemplateEditor()
    }
  }
</script>

<BasePopup on:click-outside={closeTemplateEditor}>
  <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: center;">
    {#if $template.iconURL && $activeTab === 'weekly'}
      <button on:click={() => iconsMenu = !iconsMenu} class="icon-container" class:active={iconsMenu}>
        <img src={$template.iconURL} style="width: 100%; height: 100%; border-radius: 50%;" alt="Task icon" />
      </button>
    {/if}

    <!-- on:input={(e) => debouncedRenameTask(e.target.value)} -->
    <input value={$template.name} type="text" placeholder="Untitled" style="width: 100%; font-size: 24px;" class="title-underline-input" />
  </div>
  
  {#if iconsMenu}
    <IconsDisplay />
  {/if}

  <!-- <EditTime /> -->
    
  <PeriodicityInputs />

  {#if $hasUnsavedChanges}
    <div class="changes-section">
      <PreviewChanges />

      <div class="action-button-container">
        <RoundButton on:click={handleSave} backgroundColor="rgb(0, 89, 125)" textColor="white">
          Apply changes
        </RoundButton>
      </div>
    </div>
  {/if}

  <button on:click|stopPropagation={handleDelete} class="material-symbols-outlined delete-button">
    delete
  </button>
</BasePopup>

<style>
  .title-underline-input { /* @see https://stackoverflow.com/a/3131082/7812829 */
    background: transparent;
    border: none;
    outline: none;
    font-size: 23px;
    font-weight: 700;
    padding-left: 0px;
  }

  .icon-container {
    width: 48px;
    height: 48px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    border-radius: 50%;
  }
  
  .icon-container.active {
    box-shadow: 0 2px 8px rgba(90, 179, 39, 0.5);
  }

  .changes-section {
    margin-top: 24px;
    width: 100%;
  }

  .action-button-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .delete-button {
    position: absolute;
    bottom: 16px;
    right: 16px;
    border-radius: 50%;
    padding: 4px;
  }
</style>