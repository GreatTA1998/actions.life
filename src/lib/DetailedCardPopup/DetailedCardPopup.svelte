<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte'
  import { mostRecentlyCompletedTaskID, defaultPhotoLayout, photoLayoutOptions, getIconForLayout, closeDetailedCard } from '/src/store'
  import _ from 'lodash'
  import RecursiveBulletPoint from '$lib/DetailedCardPopup/RecursiveBulletPoint.svelte'
  import UXFormTextArea from '$lib/DetailedCardPopup/UXFormTextArea.svelte'
  import Checkbox from '$lib/Reusable/Checkbox.svelte'
  import StartTimeDurationNotify from '$lib/DetailedCardPopup/StartTimeDurationNotify.svelte'
  import PhotoUpload from './PhotoUpload.svelte'
  import { findTaskByID } from '/src/helpers/utils.js'

  export let taskObject 

  let TaskImageElem
  let PopupElem

  let journalLayout = taskObject.photoLayout || $defaultPhotoLayout
  // don't delete yet, as these might be needed for input element bindings
  let notesAboutTask = taskObject.notes || ''
  let titleOfTask = taskObject.name || ''
  let isViewingPhoto = false
  const dispatch = createEventDispatcher()

  let fullPhotoWidth
  let fullPhotoHeight 

  const debouncedSaveTitle = _.debounce(saveTitle, 800)
  const debouncedSaveNotes = _.debounce(saveNotes, 1500)

  onMount(() => {
    if (taskObject.imageDownloadURL) {
      computePhotoFullDisplaySize()
    }
  })

  $: if (PopupElem && journalLayout === 'full-photo') {
    setPopupToFullPhotoSize()
  }

  $: if (PopupElem && journalLayout !== 'full-photo') {
    resetPopupCSS()
  }

  onDestroy(() => {})

  function setPopupToFullPhotoSize () {
    PopupElem.style.width = fullPhotoWidth + 'px'
    PopupElem.style.height = fullPhotoHeight + 'px'
  }

  function resetPopupCSS () {
    PopupElem.style.width = ''
    PopupElem.style.height = ''
  }

  function computePhotoFullDisplaySize () {
    // solution based on Claude
    TaskImageElem.onload = () => {
      const marginFactor = 0.9
      const viewportHeight = marginFactor * window.innerHeight
      const viewportWidth = marginFactor * window.innerWidth

      const { naturalWidth, naturalHeight } = TaskImageElem

      const imageAspectRatio = naturalWidth / naturalHeight
      const viewportAspectRatio = viewportWidth / viewportHeight

      let maxWidth, maxHeight

      if (imageAspectRatio > viewportAspectRatio) {
        // Image is wider than the viewport, so scale based on width
        maxWidth = viewportWidth
        maxHeight = Math.floor(viewportWidth / imageAspectRatio)
      } else {
        // Image is taller than the viewport, so scale based on height
        maxHeight = viewportHeight
        maxWidth = Math.floor(viewportHeight * imageAspectRatio)
      }

      fullPhotoWidth = maxWidth
      fullPhotoHeight = maxHeight
    }
  }

  // the other place to pay attention to is <RecursiveTask/>
  // but the idea is still the same, provide an "undo"
  // for root level tasks because they disappear on completion
  function handleCheckboxChange (e) {
    if (taskObject.parentID === '') {
      mostRecentlyCompletedTaskID.set(taskObject.id)
    }
    dispatch('task-update', {
      id: taskObject.id,
      keyValueChanges: { isDone: e.target.checked }
    })

    dispatch('card-close')
  }

  function updatePhotoLayout (layout) {
    // quick-fix as the popup is not reactive to task updates
    journalLayout = layout

    dispatch('task-update', { id: taskObject.id, keyValueChanges: { photoLayout: layout }})
  }

  function handleDelete () {
    dispatch("task-delete", { ...taskObject });
    closeDetailedCard();
  }

  function handleDeleteChildren () {
    dispatch("task-delete-children", { ...taskObject })
    closeDetailedCard();
  }

  function handleClickOutside (e) {
    closeDetailedCard();
  }

  function saveNotes (newVal) {
    taskObject.notes = newVal
    dispatch('task-update', { id: taskObject.id, keyValueChanges: { notes: newVal }})
  }

  function saveTitle (newVal) {
    dispatch('task-update', { id: taskObject.id, keyValueChanges: { name: newVal }})
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="fullscreen-invisible-modular-popup-layer" on:click|self={handleClickOutside} style="z-index: 10;">
  <div class="detailed-card-popup {journalLayout}-container" bind:this={PopupElem}>
    <div class="{journalLayout}">
      {#if taskObject.imageDownloadURL}
        <img src={taskObject.imageDownloadURL}
          on:click|self={() => isViewingPhoto ? isViewingPhoto = false : ''} 
          bind:this={TaskImageElem}
          class:clear-image={isViewingPhoto}
          class="{journalLayout}-image"
          alt="Task"
        >
      {/if}

      <div class="{journalLayout}-details" style="flex-grow: 1; flex-basis: 0; display: flex; flex-direction: column; row-gap: 2px;">
        <div style="display: flex; align-items: center; column-gap: 12px;">
          {#if !taskObject.imageDownloadURL}
            <Checkbox value={taskObject.isDone}
              on:change={(e) => handleCheckboxChange(e)}
              zoom={1.2}
            />
          {/if}
          <input bind:value={titleOfTask} 
            on:input={(e) => debouncedSaveTitle(e.target.value)}
            placeholder="Untitled"
            type="text" 
            style="width: 100%; box-sizing: border-box; font-size: 24px;"
          >
        </div>

        <StartTimeDurationNotify {taskObject}
          on:task-update
        />

        <div style="width: 100%;">
          <UXFormTextArea value={notesAboutTask}
            on:input={(e) => debouncedSaveNotes(e.detail)}
            fieldLabel=""
            placeholder="Notes..."
          />
        </div>

        <div style="margin-top: 16px;"></div>

        <div>
          persistsOnList: {taskObject.persistsOnList}
          isArchived: {taskObject.isArchived} 
          listID: {taskObject.listID}
          children: {taskObject.children.map(child => child.name)}
        </div>

        <span on:click={() => dispatch('task-update', { id: taskObject.id, keyValueChanges: { childrenLayout: 'timeline' } })}
          class:selected={taskObject.childrenLayout === 'timeline'}
        >
          Timeline
        </span>
        <span on:click={() => dispatch('task-update', { id: taskObject.id, keyValueChanges: { childrenLayout: 'normal' } })}
          class:selected={taskObject.childrenLayout === 'normal'}
        >
          Normal
        </span>

        <div style="display: flex; align-items: center; width: 100%;">
          {#if taskObject.imageDownloadURL}
            <div style="display: flex; column-gap: 6px;">
              {#each photoLayoutOptions as layout}
                <button on:click={() => updatePhotoLayout(layout)} class="material-symbols-outlined">
                  {getIconForLayout(layout)}
                </button>
              {/each}
            </div>
          {/if}

          <PhotoUpload {taskObject}/>

          <button on:click|stopPropagation={handleDelete} class="delete-button material-symbols-outlined">
            delete
          </button>
          
          <button on:click|stopPropagation={handleDeleteChildren}
            class="material-symbols-outlined delete-button"
            style="cursor: pointer; margin-left: auto; right: 0px; border: 1px solid grey; border-radius: 24px; padding: 4px; position: relative;"
          >
            bomb
            <span class="tooltip">Delete this task and all its children</span>
          </button>
        </div>

        <div style="font-size: 1rem; margin-top: 16px; margin-bottom: 12px; font-weight: 400;">
          Tree History
        </div>

        <!-- <div style="max-height: 500px; overflow-y: auto;">
          <RecursiveBulletPoint
            taskObject={taskObject.parentID ? findTaskByID(taskObject.parentID) : taskObject}
            originalPopupTask={taskObject}
            on:task-click
            on:task-update
          />
        </div> -->
      </div>
      <!-- End of task details container -->
    </div>
    <!-- End of padding container -->
  </div>
  <!-- End of detailed-card-popup -->
</div>
<!-- End of modular invisible layer -->

<style src='./DetailedCardPopup.css'></style>