<script>
  export let orientation = 'vertical' // for horizontal resizing (side-by-side), 'horizontal' for vertical resizing (top-below)
</script>

<div class="resize-handle" class:horizontal={orientation === 'horizontal'}>
  <!-- reason for handling touchstart: https://pqina.nl/blog/blocking-navigation-gestures-on-ios-13-4/ -->
  <div class="resize-fab" 
    on:pointerdown|stopPropagation|preventDefault|nonpassive
    on:touchstart|stopPropagation|preventDefault|nonpassive
  >
    {#if orientation === 'horizontal'}
      <!-- Horizontal lines for vertical resizing (top-below) -->
      <svg width="36" height="12" viewBox="0 0 36 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="2" width="24" height="0.5" fill="var(--grip-line-color)" />
        <rect x="0" y="5.75" width="36" height="0.5" fill="var(--grip-line-color)" />
        <rect x="6" y="9.5" width="24" height="0.5" fill="var(--grip-line-color)" />
      </svg>
    {:else}
      <!-- Vertical lines for horizontal resizing (side-by-side) -->
      <svg width="12" height="36" viewBox="0 0 12 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="6" width="0.5" height="24" fill="var(--grip-line-color)" />
        <rect x="5.75" y="0" width="0.5" height="36" fill="var(--grip-line-color)" />
        <rect x="9.5" y="6" width="0.5" height="24" fill="var(--grip-line-color)" />
      </svg>
    {/if}
  </div>
</div>

<style>
  .resize-handle {
    width: 0; /* No width for vertical orientation */
    height: 80px; /* Limited height for vertical orientation */
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .resize-handle.horizontal {
    height: 0; /* No height for horizontal orientation */
    width: 80px; /* Limited width for horizontal orientation */
    left: 50%;
    top: auto;
    transform: translateX(-50%);
  }
  
  .resize-fab {
    touch-action: none;

    width: 48px;
    height: 48px;
    background-color: rgba(255, 255, 255, 0.00);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    cursor: pointer;
    left: -24px; /* center the larger handle on the boundary for vertical */
  }
  
  .resize-handle.horizontal .resize-fab {
    left: auto;
    top: -24px; /* center the larger handle on the boundary for horizontal */
  }
</style>