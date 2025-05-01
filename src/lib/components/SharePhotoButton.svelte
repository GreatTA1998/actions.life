<script>
  import { onMount } from 'svelte'
  import { formatDate } from '/src/lib/utils/core.js'
  
  // Props
  export let imageURL = ''
  export let date = ''
  export let notes = ''
  export let showDownload = false
  export let buttonSize = '32px'
  export let iconSize = '22px'
  export let lightTheme = false
  
  // State
  let shareSupported = false
  
  onMount(() => {
    // Check if Web Share API is supported
    shareSupported = !!navigator.share
  })
  
  // Share a photo
  async function sharePhoto(event) {
    // Stop the click from propagating to the parent
    event.stopPropagation()
    
    if (!imageURL) return
    
    try {
      if (navigator.share) {
        // Use Web Share API (works on mobile)
        await navigator.share({
          title: date ? `Photo from ${formatDate(date)}` : 'Shared photo',
          text: notes || 'Shared from Actions Life',
          url: imageURL
        })
      } else {
        // Fallback for desktop - copy image URL
        await navigator.clipboard.writeText(imageURL)
        alert('Image URL copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      // User likely canceled share operation, no need to show error
    }
  }
  
  // Download a photo
  function downloadPhoto(event) {
    // Stop the click from propagating to the parent
    event.stopPropagation()
    
    if (!imageURL) return
    
    // Create a temporary link element
    const link = document.createElement('a')
    link.href = imageURL
    link.download = `photo-${date || 'actions-life'}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
</script>

<div class="photo-actions">
  <button 
    class="photo-action-button" 
    class:light-theme={lightTheme}
    on:click={sharePhoto}
    title="Share photo"
    style="width: {buttonSize}; height: {buttonSize};"
  >
    <span class="material-symbols-outlined" style="font-size: {iconSize};">
      ios_share
    </span>
  </button>
  
  {#if showDownload}
    <button 
      class="photo-action-button"
      class:light-theme={lightTheme} 
      on:click={downloadPhoto}
      title="Download photo"
      style="width: {buttonSize}; height: {buttonSize};"
    >
      <span class="material-symbols-outlined" style="font-size: {iconSize};">download</span>
    </button>
  {/if}
</div>

<style>
  .photo-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
  
  .photo-action-button {
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .photo-action-button.light-theme {
    color: #333;
  }
</style> 