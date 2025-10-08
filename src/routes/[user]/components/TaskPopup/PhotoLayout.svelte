<script>
  import { defaultPhotoLayout } from '$lib/store'
  import { onMount } from 'svelte'
  import PhotoMenuActions from './PhotoMenuActions.svelte'
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'

  let { taskObject, children } = $props()
  let journalLayout = $derived(taskObject?.photoLayout || $defaultPhotoLayout)
  $effect(() => {
    if (PopupElem) { // probably not needed because $effect runs after mount
      if (journalLayout === 'full-photo' && taskObject.imageDownloadURL) setPopupToFullPhotoSize()
      else resetPopupCSS()
    }
  })


  let PopupElem = $state(null)
  let TaskImageElem = $state(null)
  let fullPhotoWidth = $state(0)
  let fullPhotoHeight = $state(0)

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
      <PopoverMenu 
        {activator}
        {content}
      />
      {#snippet activator ({ open, close, toggle })}
        <img onclick={open}
          class="{journalLayout}-image"
          bind:this={TaskImageElem}
          src={taskObject.imageDownloadURL}
          alt="Task"
        >
      {/snippet}

      {#snippet content ()}
        <PhotoMenuActions {taskObject} />
      {/snippet}
    {/if}
    <div class="{journalLayout}-details" style="align-self: stretch; flex-grow: 1; flex-basis: 0; display: flex; flex-direction: column; row-gap: 2px;">
      {@render children()}
    </div>
  </div>
</div>

<style>
  img {
    cursor: pointer;
  }

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
    height: fit-content; /* ideally height is determined by the image, and the side overflows */
    overflow-y: hidden;
  }

  .side-by-side img {
    width: 38.2%; /* golden ratio: 1.618: 1 */
    height: auto;
  }

  .side-by-side-details {
    padding: 12px 16px;
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