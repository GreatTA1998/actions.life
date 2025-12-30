<script>
  import ToggleGroupStyled from '$lib/components/ToggleGroupStyled.svelte'
  import CheckboxSquare from '$lib/components/CheckboxSquare.svelte'
  import { defaultPhotoLayout } from '$lib/store/photoLayout.js'
  import { updateFirestoreDoc } from '$lib/db/helpers.js'
  import { getContext } from 'svelte'

  import MslSplitscreenLeft from 'virtual:icons/material-symbols-light/splitscreen-left'
  import MslSplitscreenTop from 'virtual:icons/material-symbols-light/splitscreen-top'
  import MslFullscreenPortrait from 'virtual:icons/material-symbols-light/fullscreen-portrait'

  const { user } = getContext('app')

  async function updateDefaultPhotoLayout (layoutValue) {    
    if ($user) {
      try {
        updateFirestoreDoc(`/users/${$user.uid}`, { 
          defaultPhotoLayout: layoutValue 
        })
      } catch (error) {
        console.error("Failed to save photo layout preference:", error);
      }
    }
  }

  function toggle (fieldName) {
    updateFirestoreDoc(`/users/${$user.uid}`, { 
      [fieldName]: !!!$user[fieldName] 
    })
  }
</script>

<div class="photo-settings">  
  <ToggleGroupStyled>
    <button onclick={() => updateDefaultPhotoLayout('side-by-side')} class="toggle-btn" class:active={$defaultPhotoLayout === 'side-by-side'}>
      <MslSplitscreenLeft style="font-size: 1.25rem;"/>
    </button>
    <button onclick={() => updateDefaultPhotoLayout('top-and-below')} class="toggle-btn" class:active={$defaultPhotoLayout === 'top-and-below'}>
      <MslSplitscreenTop style="font-size: 1.25rem;"/>
    </button>
    <button onclick={() => updateDefaultPhotoLayout('full-photo')} class="toggle-btn" class:active={$defaultPhotoLayout === 'full-photo'}>
      <MslFullscreenPortrait style="font-size: 1.25rem;"/>
    </button>
  </ToggleGroupStyled>

  <CheckboxSquare onClick={() => toggle('photoUploadAutoArchive')}
    value={$user.photoUploadAutoArchive}
    label="Auto-archive task after uploading a photo"
  />

  <CheckboxSquare onClick={() => toggle('photoCompressWhenAttachingToTask')}
    value={$user.photoCompressWhenAttachingToTask}
    label="Lightly compress photos"
  />
</div>

<style>
  .toggle-btn {
    display: flex;
    align-items: center;
    padding: 4px;
  } 

  .toggle-btn.active {
    background: #e3e6ee;
    color: #1a1a1a;
    font-weight: 500;
  }

  .photo-settings {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
</style>