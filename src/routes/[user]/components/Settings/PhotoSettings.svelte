<script>
  import ToggleGroup from '$lib/components/ToggleGroup.svelte'
  import { photoLayoutOptions, defaultPhotoLayout } from '$lib/store/photoLayout.js'
  import { updateFirestoreDoc } from '$lib/db/helpers.js'
  import { user } from '$lib/store'

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
</script>

<div class="photo-settings">
  <div class="layout-options">
    <ToggleGroup options={photoLayoutOptions} 
      on:select={e => updateDefaultPhotoLayout(e.detail.value)} 
      activeValue={$defaultPhotoLayout}
      useIcons
    />
  </div>
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