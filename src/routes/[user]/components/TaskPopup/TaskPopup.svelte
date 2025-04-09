<script>
  import { onMount } from 'svelte'
  import { 
    tasksCache,
    defaultPhotoLayout, 
    photoLayoutOptions, 
    getIconForLayout,
    clickedTaskID, closeTaskPopup, ancestralTree
  } from '/src/lib/store'
  import { createDebouncedFunction } from '/src/lib/utils/core.js'
  import RecursiveBulletPoint from './RecursiveBulletPoint.svelte'
  import UXFormTextArea from './UXFormTextArea.svelte'
  import Checkbox from '$lib/components/Checkbox.svelte'
  import SharePhotoButton from '$lib/components/SharePhotoButton.svelte'
  import StartTimeDurationNotify from './StartTimeDurationNotify.svelte'
  import PhotoUpload from './PhotoUpload.svelte'
  import Task from '/src/lib/db/models/Task.js'

  let TaskImageElem
  let PopupElem

  let isViewingPhoto = false
  let fullPhotoWidth, fullPhotoHeight 
  
  const debouncedUpdate = createDebouncedFunction(
    (id, keyValueChanges) => Task.update({ id, keyValueChanges }), 
    1000
  )

  $: taskObject = $tasksCache[$clickedTaskID]

  $: journalLayout = taskObject?.photoLayout || $defaultPhotoLayout
  
  $: if (PopupElem) {
    if (journalLayout === 'full-photo') setPopupToFullPhotoSize()
    else resetPopupCSS()
  }

  onMount(() => {
    if (taskObject.imageDownloadURL) {
      computePhotoFullDisplaySize()
    }
    console.log("taskObject =", taskObject)
  })

  function handleDelete () {
    Task.delete({ ...taskObject })
    closeTaskPopup()
  }

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
</script>

{#if taskObject}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="fullscreen-invisible-modular-popup-layer" on:click|self={closeTaskPopup} style="z-index: 10;">
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

        <div class="{journalLayout}-details" style="align-self: stretch; flex-grow: 1; flex-basis: 0; display: flex; flex-direction: column; row-gap: 2px;">
          <div style="display: flex; align-items: center; column-gap: 12px;">
            {#if !taskObject.imageDownloadURL}
              <Checkbox value={taskObject.isDone}
                on:change={e => Task.update({ id: taskObject.id, keyValueChanges: { isDone: e.target.checked }})}
                zoom={1.2}
              />
            {/if}
            <input 
              value={taskObject.name}
              on:input={e => debouncedUpdate($clickedTaskID, { name: e.target.value })}
              placeholder="Untitled"
              type="text" 
              style="width: 100%; box-sizing: border-box; font-size: 24px;"
            >
          </div>

          <StartTimeDurationNotify {taskObject} />

          <div class="notes-tree-container" style="width: 100%; display: flex; flex-wrap: wrap; gap: 12px;">
            <div class="notes-section" style="flex: 999 1 100%; min-width: 0;">
              <UXFormTextArea value={taskObject.notes}
                on:input={e => debouncedUpdate($clickedTaskID, { notes: e.detail })}
                fieldLabel=""
                placeholder="Notes..."
              />
            </div>

            {#if $ancestralTree}
              <div class="tree-section" style="flex: 0 1 100%; min-width: 0; display: grid; row-gap: 12px;">
                {#if $ancestralTree.children.length > 0}
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
                {/if}
                
                <RecursiveBulletPoint
                  originalPopupTask={taskObject}
                  node={$ancestralTree}
                />
              </div>
            {/if} 
          </div>

          <div style="margin-top: 16px;"></div>

          <div style="margin-top: auto; margin-bottom: 0; display: flex; align-items: center; width: 100%; column-gap: 12px;">
            {#if taskObject.imageDownloadURL}
              <div style="display: flex; column-gap: 6px;">
                {#each photoLayoutOptions as layout}
                  <button on:click={() => Task.update({ id: taskObject.id, keyValueChanges: { photoLayout: layout }})} class="material-symbols-outlined">
                    {getIconForLayout(layout)}
                  </button>
                {/each}
              </div>
            
              <SharePhotoButton 
                imageURL={taskObject.imageDownloadURL}
                date={taskObject.startDateISO}
                notes={taskObject.notes}
                lightTheme={true}
              />
            {/if}

            <PhotoUpload {taskObject}/>

            <button on:click={async () => {
              await Task.archiveTree({ id: taskObject.id })
              closeTaskPopup()
            }}
            >
              <span class="material-symbols-outlined" style="font-size: 22px; padding: 4px; font-weight: 600">
                inventory_2
              </span>
              <span class="tooltip">Archive this task and all its children</span>
            </button>

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
    width: 100%;
    max-height: 90dvh;
    font-size: 14px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 4;    
    border-radius: 24px;
    background-color: white;
    box-shadow: 0px 0px 0px 9999px rgba(0, 0, 0, 0.5);
    overflow-y: auto;
  }

  @media (min-width: 768px) {
    .task-popup {
      width: 70%;
    }

    :global(.task-popup .notes-tree-container) {
      flex-wrap: nowrap !important;
    }

    :global(.task-popup .notes-section) {
      flex: 999 1 400px !important;
    }

    :global(.task-popup .tree-section) {
      flex: 0 1 200px !important;
    }
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