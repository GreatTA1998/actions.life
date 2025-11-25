<script>
  import { shareEngravedImage } from '$lib/utils/imageExport.js'
  import PopoverSnackbar from '$lib/components/PopoverSnackbar.svelte'
  
  let { taskObject } = $props()
  
  let snackbarMessage = $state('')
  
  async function sharePhoto (e) {
    e.stopPropagation()
    try {
      const { imageDownloadURL, name, startDateISO } = taskObject
      await shareEngravedImage(imageDownloadURL, startDateISO, name)
      snackbarMessage = 'Photo ready to share'
    } catch (error) {
      console.error('Error sharing engraved photo:', error)
      snackbarMessage = 'Failed to share photo. Error sent to developer.'
    }
  }
</script>

<div>
  <PopoverSnackbar {activator} {customActions} />
  
  {#snippet activator({ open, close, setLoading })}
    <button 
      class="photo-row-action"
      onclick={async (e) => {
        await sharePhoto(e)
        if (snackbarMessage) {
          open()
          close({ timeout: 5000 })
        }
      }}
    >
      <span class="material-symbols-outlined">ios_share</span>
      <span class="photo-row-label">Share</span>
    </button>
  {/snippet}
  
  {#snippet customActions({ open, close, setLoading })}
    <div style="color: white;">{snackbarMessage}</div>
  {/snippet}
</div>

<style>
  .photo-row-action {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: #333;
    font-size: 14px;
    padding: 4px 8px;
    border-radius: 6px;
    transition: background 0.2s;
    width: 100%;
    justify-content: flex-start;
  }

  .photo-row-action .material-symbols-outlined {
    font-size: 18px;
  }

  .photo-row-label {
    font-size: 14px;
  }

  .photo-row-action:hover {
    background: rgba(0,0,0,0.05);
  }
</style> 