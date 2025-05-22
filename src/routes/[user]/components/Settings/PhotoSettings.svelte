<script>
  import { PhotoLayout, photoLayoutOptions, getIconForLayout, defaultPhotoLayout } from '$lib/store/photoLayout.js'
  import { updateFirestoreDoc } from '$lib/db/helpers.js'
  import { user } from '$lib/store'

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

  // Helper function to get readable layout name
  function getReadableLayoutName(layout) {
    const names = {
      'side-by-side': 'Side By Side',
      'top-and-below': 'Top And Below',
      'full-photo': 'Full Photo'
    };
    return names[layout] || layout.replace(/-/g, ' ');
  }

  // Get description text for the selected layout
  function getLayoutDescription(layout) {
    if (layout === PhotoLayout.SIDE_BY_SIDE.value) {
      return "Photo appears beside notes and details";
    } else if (layout === PhotoLayout.TOP_AND_BELOW.value) {
      return "Photo appears above notes and details";
    } else if (layout === PhotoLayout.FULL_PHOTO.value) {
      return "Photo takes up the entire card with minimal UI";
    }
    return "";
  }
</script>

<div class="photo-settings">
  <div class="layout-options">
    {#each photoLayoutOptions as layout}
      <button 
        on:click={() => updateDefaultPhotoLayout(layout)}
        class="layout-option"
        class:active={$defaultPhotoLayout === layout}
      >
        <span class="material-symbols-outlined layout-icon">
          {getIconForLayout(layout)}
        </span>
        <span class="layout-name">
          {getReadableLayoutName(layout)}
        </span>
      </button>
    {/each}
  </div>

  <div class="layout-description">
    {getLayoutDescription($defaultPhotoLayout)}
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
  
  .layout-option {
    height: 80px;
    background: #f8f8f8;
    border: 1px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 8px;
    transition: all 0.15s ease;
  }
  
  .layout-option:hover {
    background: #f0f0f0;
  }
  
  .layout-option.active {
    border-color: #6b6b6b;
    background: white;
  }
  
  .layout-icon {
    font-size: 24px;
    color: #555;
    margin-bottom: 8px;
  }
  
  .layout-name {
    font-size: 12px;
    color: #555;
    font-weight: 500;
    text-align: center;
  }
  
  .layout-description {
    font-size: 12px;
    color: #777;
    margin-top: 4px;
  }
</style>