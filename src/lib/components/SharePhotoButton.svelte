<script>
  import { onMount } from 'svelte'
  import { formatDate } from '/src/lib/utils/core.js'
  
  export let imageURL = ''
  export let date = ''
  export let notes = ''
  
  let shareSupported = false
  
  onMount(() => {
    // Check if Web Share API is supported
    shareSupported = !!navigator.share
  })
  
  async function sharePhoto(event) {
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
  
  function downloadPhoto(event) {
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

<div>
  <button 
    class="photo-row-action"
    on:click={sharePhoto}
    title="Share photo"
  >
    <span class="material-symbols-outlined">ios_share</span>
    <span class="photo-row-label">Share</span>
  </button>
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
    cursor: pointer;
    transition: background 0.2s;
    font-weight: 400;
    width: 100%;
    justify-content: flex-start;
    box-sizing: border-box;
  }

  .photo-row-action .material-symbols-outlined {
    font-size: 18px;
  }

  .photo-row-label {
    font-size: 14px;
    font-weight: 400;
  }

  .photo-row-action:hover {
    background: rgba(0,0,0,0.05);
  }
</style> 