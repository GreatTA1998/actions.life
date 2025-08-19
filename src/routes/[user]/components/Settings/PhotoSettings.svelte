<script>
  import ToggleGroup from '$lib/components/ToggleGroup.svelte'
  import CheckboxSquare from '$lib/components/CheckboxSquare.svelte'
  import { photoLayoutOptions, defaultPhotoLayout } from '$lib/store/photoLayout.js'
  import { updateFirestoreDoc } from '$lib/db/helpers.js'
  import { getContext } from 'svelte'

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
    console.log('fieldName =', fieldName)
    updateFirestoreDoc(`/users/${$user.uid}`, { 
      [fieldName]: !!!$user[fieldName] 
    })
  }
</script>

<div class="photo-settings">  
  <div class="layout-options">
    <ToggleGroup options={photoLayoutOptions} 
      on:select={e => updateDefaultPhotoLayout(e.detail.value)} 
      activeValue={$defaultPhotoLayout}
      useIcons
    />
  </div>

  <CheckboxSquare onClick={() => toggle('photoUploadAutoArchive')}
    value={$user.photoUploadAutoArchive}
    label="Auto-archive task after uploading a photo"
  />

  <CheckboxSquare onClick={() => toggle('photoCompressWhenAttachingToTask')}
    value={$user.photoCompressWhenAttachingToTask}
    label="Lightly compress photo if it's a task attachment"
  />
</div>

<style>
  .photo-settings {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .layout-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    width: 100%;
  }
</style>