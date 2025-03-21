<script>
  import { onMount, onDestroy } from 'svelte'
  import { 
    tasksCache,
    mostRecentlyCompletedTaskID, 
    defaultPhotoLayout, 
    photoLayoutOptions, 
    getIconForLayout,
    clickedTaskID,
    closeTaskPopup
  } from '/src/lib/store'
  import { treesByID } from '../../components/Calendar/store.js'
  import { createDebouncedFunction } from '/src/lib/utils/core.js'
  import RecursiveBulletPoint from './RecursiveBulletPoint.svelte'
  import UXFormTextArea from './UXFormTextArea.svelte'
  import Checkbox from '$lib/Reusable/Checkbox.svelte'
  import StartTimeDurationNotify from './StartTimeDurationNotify.svelte'
  import PhotoUpload from './PhotoUpload.svelte'
  import { getRoot } from '/src/lib/db/models/treeISOs.js'
  import Task from '/src/lib/db/models/Task.js'

  let TaskImageElem
  let PopupElem

  let isViewingPhoto = false

  let fullPhotoWidth, fullPhotoHeight 

  const debouncedSaveTitle = createDebouncedFunction(saveTitle, 800)
  const debouncedSaveNotes = createDebouncedFunction(saveNotes, 1500)

  $: taskObject = $tasksCache[$clickedTaskID]

  $: journalLayout = taskObject?.photoLayout || $defaultPhotoLayout
  
  $: if (PopupElem && journalLayout === 'full-photo') {
    setPopupToFullPhotoSize()
  }

  $: if (PopupElem && journalLayout !== 'full-photo') {
    resetPopupCSS()
  }

  onMount(() => {
    if (taskObject.imageDownloadURL) {
      computePhotoFullDisplaySize()
    }
    console.log("taskObject =", taskObject)
  })

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
    Task.update({
      id: taskObject.id,
      keyValueChanges: { isDone: e.target.checked }
    })
    closeTaskPopup()
  }

  function updatePhotoLayout (layout) {
    Task.update({ id: taskObject.id, keyValueChanges: { photoLayout: layout }})
  }

  function handleDelete () {
    Task.delete({ ...taskObject });
    closeTaskPopup();
  }

  function handleClickOutside (e) {
    closeTaskPopup();
  }

  // note: if the popup closes before this debounced function is called, taskObject.id will be undefined
  function saveNotes (newVal) {
    Task.update({ id: taskObject.id, keyValueChanges: { notes: newVal }})
  }

  function saveTitle (newVal) {
    Task.update({ id: taskObject.id, keyValueChanges: { name: newVal }})
  }
</script>

{#if taskObject}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="fullscreen-invisible-modular-popup-layer" on:click|self={handleClickOutside} style="z-index: 10;">
    <div class="task-popup {journalLayout}-container" bind:this={PopupElem}>
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
            <input 
              value={taskObject.name}
              on:input={(e) => debouncedSaveTitle(e.target.value)}
              placeholder="Untitled"
              type="text" 
              style="width: 100%; box-sizing: border-box; font-size: 24px;"
            >
          </div>

          <StartTimeDurationNotify {taskObject} />

          <div style="width: 100%; display: flex; column-gap: 12px;">
            <div style="flex-grow: 1; flex-basis: 0;">
              <UXFormTextArea value={taskObject.notes}
                on:input={(e) => debouncedSaveNotes(e.detail)}
                fieldLabel=""
                placeholder="Notes..."
              />
            </div>

            {#if $treesByID[taskObject.id]}
              <div style="flex-grow: 1; flex-basis: 0; max-height: 500px; overflow-y: auto;">
                <RecursiveBulletPoint
                  originalPopupTask={$treesByID[taskObject.id]}
                  taskObject={$treesByID[getRoot($tasksCache[taskObject.id]).id]}
                />
              </div>
            {/if}
          </div>

          <div style="margin-top: 16px;"></div>

          <div style="display: flex; align-items: center; column-gap: 12px; padding: 12px;">
            <div>
              persistsOnList: {taskObject.persistsOnList} |
              isArchived: {taskObject.isArchived} |
              listID: {taskObject.listID} |
              treeISOs: {JSON.stringify(taskObject.treeISOs)}
            </div>
          </div>
 
          <div style="display: flex; align-items: center; width: 100%; column-gap: 12px;">
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

            <div style="display: flex; align-items: center; width: fit-content; box-sizing: border-box;">
              <span on:click={() => Task.update({ id: taskObject.id, keyValueChanges: { childrenLayout: 'timeline' } })}
                class:selected={taskObject.childrenLayout === 'timeline'}
                class:unselected={taskObject.childrenLayout !== 'timeline'}
                style="padding: 2px 8px;"
              >
                Timeline
              </span>
  
              <span on:click={() => Task.update({ id: taskObject.id, keyValueChanges: { childrenLayout: 'normal' } })}
                class:selected={taskObject.childrenLayout === 'normal'}
                class:unselected={taskObject.childrenLayout !== 'normal'}
                style="padding: 2px 8px;"
              >
                Normal
              </span>
            </div>  

            <button on:click|stopPropagation={handleDelete} class="delete-button material-symbols-outlined">
              delete
              <span class="tooltip">Delete this task and all its children</span>
            </button>
          </div>
        </div>
        <!-- task details container -->
      </div>
      <!-- padding container -->
    </div>
    <!-- task-popup -->
  </div>
  <!-- modular invisible layer -->
{/if}

<style>
  .selected {
    border-bottom: 2px solid rgb(255, 196, 87);
  }

  .unselected {
    border-bottom: 2px solid lightgrey;
    color: lightgrey;
  }

  .side-by-side {
    display: flex;
    
    /* remember the caveat that align-items causes stretching by default */
    align-items: flex-start; 
  }

  .side-by-side-container {
    /* ideally height is determined by the image, and the side overflows */
    height: fit-content;
    overflow-y: hidden;
  }

  .side-by-side img {
    /* golden ratio: 1.618: 1 */
    width: 38.2%;
    height: auto;
  }

  .side-by-side-details {
    padding: 12px;
    overflow-y: auto;
  }

  .top-and-below-container {
    overflow: hidden;
  }

  .top-and-below img {
    height: 40vh;
    width: 100%;
    object-fit: cover;
    object-position: center;
  }

  .top-and-below-details {
    padding: 12px;
  }

  .full-photo-container {
    height: 50%;
    overflow-y: auto;
  }

  .full-photo img {
    width: 100%;
    height: 100%;
  }

  .full-photo-details {
    padding: 16px;
  }

  .delete-button {
    margin-left: auto; 
    right: 0px; 
    border-radius: 24px; 
    padding: 4px;
  }

  ::-webkit-scrollbar {
    width: 0px;
    height: 0px;
    background: transparent;
  }

  .blurred-image {
    filter: blur(6px) brightness(1.0) contrast(1.0) saturate(1.0);  z-index: -1;
  }

  .clear-image {
    z-index: 1;
  }

  .task-popup {
    position: fixed;
    width: 60%;
    font-size: 14px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 4;    
    border-radius: 24px;
    background-color: white;

    /* border: 1px solid #000; box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);*/
    box-shadow:  0px 0px 0px 9999px rgba(0, 0, 0, 0.5);
  }

  /* Refer to: https://stackoverflow.com/a/3131082/7812829 */
  input[type=text] {
    background: transparent;
    border: none;
    border-bottom: 1px solid black;
    outline: none;
    font-size: 23px;
    font-weight: 700;
    padding-left: 0px;
    padding-bottom: 6px;
  }


  .material-symbols-outlined {
    font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 48
  }

  .delete-button {
    position: relative;
  }

  .tooltip {
    visibility: hidden;
    background-color: #555;
    color: white;
    text-align: center;
    padding: 5px;
    border-radius: 6px;
    position: absolute;
    z-index: 5;
    bottom: 125%;
    right: 0;
    transform: translateY(-5px);
    white-space: nowrap;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
  }

  .delete-button:hover .tooltip {
    visibility: visible;
  }
</style> 