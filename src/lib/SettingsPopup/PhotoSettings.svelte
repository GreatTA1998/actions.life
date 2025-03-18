<script>
  import { PhotoLayout, photoLayoutOptions, getIconForLayout, defaultPhotoLayout } from '/src/store';
  import { updateFirestoreDoc } from '/src/helpers/firebase.js'
  import { user } from '/src/store';

  // Function to update user's default photo layout preference
  async function updateDefaultPhotoLayout(layoutValue) {    
    // Update the local store immediately for responsive UI
    defaultPhotoLayout.set(layoutValue);
    
    // Save to user profile in database
    if ($user) {
      try {
        updateFirestoreDoc(`/users/${$user.uid}`, { 
          defaultPhotoLayout: layoutValue 
        })
      } catch (error) {
        console.error("Failed to save photo layout preference:", error);
        // You might want to show an error notification here
      }
    }
  }
</script>

<div class="photo-settings-container">
  <h3>Default Layout for Photos</h3>
  
  <div class="layout-options">
    {#each photoLayoutOptions as layout}
      <button on:click={() => updateDefaultPhotoLayout(layout)}
        class="layout-option {$defaultPhotoLayout === layout ? 'selected' : ''}"
      >
        <div class="layout-icon material-symbols-outlined">
          {getIconForLayout(layout)}
        </div>
        <div class="layout-label">
          {layout.replace(/-/g, ' ')}
        </div>
      </button>
    {/each}
  </div>
  
  <div class="layout-description">
    {#if $defaultPhotoLayout === PhotoLayout.SIDE_BY_SIDE.value}
      Photo appears beside notes and details
    {:else if $defaultPhotoLayout === PhotoLayout.TOP_AND_BELOW.value}
      Photo appears above notes and details
    {:else if $defaultPhotoLayout === PhotoLayout.FULL_PHOTO.value}
      Photo takes up the entire card with minimal UI
    {/if}
  </div>
</div>

<style>
  .photo-settings-container {
    padding: 16px;
  }
  
  h3 {
    margin-top: 0;
    margin-bottom: 16px;
  }
  
  .layout-options {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
  }
  
  .layout-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 12px;
    border-radius: 8px;
    transition: background-color 0.2s;
  }
  
  .layout-option:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  .layout-option.selected {
    background-color: rgba(0, 0, 0, 0.1);
  }
  
  .layout-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }
  
  .layout-label {
    text-transform: capitalize;
    font-size: 14px;
  }
  
  .layout-description {
    font-size: 14px;
    color: #666;
    margin-top: 8px;
  }
</style>