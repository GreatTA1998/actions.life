<script>
  import { shareEngravedImage } from '$lib/utils/imageExport.js'
  import MslIosShare from 'virtual:icons/material-symbols-light/ios-share'
  
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

<button onclick={e => sharePhoto(e)} class="photo-row-action">
  <MslIosShare style="font-size: 1.125rem;"/>
  <span class="photo-row-label">Share captioned photo</span>
</button>

<style>
  .photo-row-action {
    display: flex;
    align-items: center;
    gap: 4px;
    color: #333;
    font-size: 14px;
    padding: 4px 8px;
    border-radius: 6px;
    width: 100%;
    justify-content: flex-start;
  }

  .photo-row-label {
    font-size: 0.875rem;
  }

  .photo-row-action:hover {
    background: rgba(0,0,0,0.05);
  }
</style> 