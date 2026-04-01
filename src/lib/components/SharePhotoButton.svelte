<script>
  import { shareEngravedImage } from '$lib/utils/imageExport.js'
  import MslIosShare from 'virtual:icons/material-symbols-light/ios-share'
  
  let { task } = $props()
  
  let snackbarMessage = $state('')
  
  async function sharePhoto (e) {
    e.stopPropagation()
    try {
      const { imageDownloadURL, name, startDateISO } = task
      await shareEngravedImage(imageDownloadURL, startDateISO, name)
      snackbarMessage = 'Photo ready to share'
    } catch (error) {
      console.error('Error sharing engraved photo:', error)
      snackbarMessage = 'Failed to share photo. Error sent to developer.'
    }
  }
</script>

<button onclick={e => sharePhoto(e)} class="justify-start gap-x-1 py-2 px-3">
  <MslIosShare style="font-size: 1.5rem"/>

  <span class="text-base text-[#333]">
    Share captioned photo
  </span>
</button>