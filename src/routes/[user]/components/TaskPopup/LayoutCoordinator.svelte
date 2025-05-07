<script>
  import PhotoUpload from './PhotoUpload.svelte'
  import SharePhotoButton from '$lib/components/SharePhotoButton.svelte'
  import Task from '$lib/db/models/Task.js'
  import { defaultPhotoLayout, photoLayoutOptions, getIconForLayout } from '$lib/store'
  import { onMount } from 'svelte'

  export let taskObject

  let PopupElem, TaskImageElem
  let fullPhotoWidth, fullPhotoHeight 
  let menu = false

  $: journalLayout = taskObject?.photoLayout || $defaultPhotoLayout

  $: if (PopupElem) {
    if (journalLayout === 'full-photo') setPopupToFullPhotoSize()
    else resetPopupCSS()
  }

  onMount(() => {
    if (taskObject.imageDownloadURL) {
      computePhotoFullDisplaySize()
    }
  })

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

      if (imageAspectRatio > viewportAspectRatio) { // Image is wider than the viewport, so scale based on width
        maxWidth = viewportWidth
        maxHeight = Math.floor(viewportWidth / imageAspectRatio)
      } else { // Image is taller than the viewport, so scale based on height
        maxHeight = viewportHeight
        maxWidth = Math.floor(viewportHeight * imageAspectRatio)
      }

      fullPhotoWidth = maxWidth
      fullPhotoHeight = maxHeight
    }
  }
</script>

<div class="{journalLayout}-container" bind:this={PopupElem}>
  <div class={journalLayout}>
    {#if taskObject.imageDownloadURL}
      <div style="position: relative;">
        <img bind:this={TaskImageElem}
          src={taskObject.imageDownloadURL}
          class="{journalLayout}-image"
          alt="Task"
        >
        <button on:click={() => menu = !menu} style="position: absolute; bottom: 4px; right: 4px; color: white; font-weight: 800; border-radius: 50%; padding: 4px; border: none; cursor: pointer;" class="material-symbols-outlined">
          more_vert
        </button>

        {#if menu}
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
          />
        {/if}

        <PhotoUpload {taskObject}/>
      {/if}


      </div>
    {/if}
    <div class="{journalLayout}-details" style="align-self: stretch; flex-grow: 1; flex-basis: 0; display: flex; flex-direction: column; row-gap: 2px;">
      <slot>

      </slot>
    </div>
  </div>
</div>

<style>
  .children-layout-options {
    display: flex; 
    align-items: center; 
    width: fit-content; 
  }

  .side-by-side {
    display: flex;
    align-items: flex-start; /* remember the caveat that align-items causes stretching by default */
  }

  .side-by-side-container {
    /* ideally height is determined by the image, and the side overflows */
    height: fit-content;
    overflow-y: hidden;
  }

  .side-by-side img {
    width: 38.2%; /* golden ratio: 1.618: 1 */
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
    border-radius: 24px; 
  }

  ::-webkit-scrollbar {
    width: 0px;
    height: 0px;
    background: transparent;
  }

  .blurred-image {
    filter: blur(6px) brightness(1.0) contrast(1.0) saturate(1.0);  
    z-index: -1;
  }

  .clear-image {
    z-index: 1;
  }

  .notes-tree-container {
    width: 100%; 
    display: flex; 
    justify-content: space-between;
    flex-wrap: wrap; 
    gap: 12px;
  }

  .ancestral-tree {
    flex: 1 1 160px;
    display: grid; 
    row-gap: 12px;
  }

  .material-symbols-outlined {
    font-variation-settings:
      'FILL' 0,
      'wght' 400,
      'GRAD' 0,
      'opsz' 48
  }

  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px;
    border-radius: 50%;
    transition: background-color 0.2s;
  }

  .action-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
</style>