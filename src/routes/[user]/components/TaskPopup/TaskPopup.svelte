<script>
  import TaskPopupContent from './TaskPopupContent.svelte'
  import { getContext } from 'svelte'
  import { innerWidth } from 'svelte/reactivity/window'

  const { tasksCache, clickedTaskID, closeTaskPopup } = getContext('app')

  let taskObject = $derived($tasksCache[$clickedTaskID])

  const W = { details1: 480, details2: 480}
  const PHI = 1.618

  async function getAspectRatio (src) {
    const img = new Image()
    img.src = src
    await img.decode()
    return img.naturalWidth / img.naturalHeight
  }

  function ontoggle (e) {
    if (e.newState === 'closed') closeTaskPopup()
  }
</script>

<dialog {ontoggle} id="task-dialog" closedby="any">
  {#if taskObject}
    {@const { imageDownloadURL, photoLayout } = taskObject}

    {#if imageDownloadURL}
      {#await getAspectRatio(imageDownloadURL) then aspectRatio}
        {#if photoLayout === 'full-photo'}
          <div>
            Full intrinsic size, subject to screen size and some exit spacing horizontally or vertically
          </div>
        {:else}
          {#if innerWidth.current < 768}
            <div style="max-height: 80dvh;">
              <div style="width: 100%; height: 40dvh;"></div>
              <div style="width: 100%; height: 40dvh; border: solid green;">
                Mobile layout {innerWidth.current}px
              </div>
            </div>
          {:else}      
            {#if aspectRatio <= 1} <!-- left portrait -->
              <div style="display: flex;">
                <img src={taskObject.imageDownloadURL}
                  style="width: {W.details2 / PHI}px; height: 400px; object-fit: cover;" 
                />
                <div style="width: {W.details2}px; 12px 16px;">
                  <TaskPopupContent />
                </div>
              </div>  
            {:else if aspectRatio > 1} <!-- top landscape -->
              <img src={taskObject.imageDownloadURL} 
                style="width: {W.details1}px; height: {W.details1 * 3/4}px; object-fit: cover;" 
              />
              <div style="width: {W.details1}px; height: 300px; padding: 12px;">
                <TaskPopupContent />
              </div>
            {/if}
          {/if}
        {/if}
      {/await}
    {:else}
      {#if innerWidth.current < 768}
        <div style="max-height: 80dvh; width: 100vw; height: fit-content; padding: 12px;">
          <TaskPopupContent />
        </div>
      {:else}
        <div style="width: 768px; padding: 12px;">
          <TaskPopupContent />
        </div>
      {/if}
    {/if}
  {/if}
</dialog>

<style>
  dialog {
    padding: 0;
    border: none;
    border-radius: 24px;
  }

  ::backdrop {
    backdrop-filter: blur(48px);
    background-color: rgba(0, 0, 0, 0.4);
  }

  dialog:-internal-dialog-in-top-layer {
    max-width: unset;
    max-height: unset;
  }

  :focus-visible {
    outline: unset;
  }
</style>