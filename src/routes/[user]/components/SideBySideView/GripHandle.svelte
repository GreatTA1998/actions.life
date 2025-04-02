<div class="resize-handle">
  <div class="resize-fab" on:pointerdown|stopPropagation|preventDefault>
    <svg width="12" height="36" viewBox="0 0 12 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="6" width="0.5" height="24" fill="var(--grip-line-color)" />
      <rect x="5.75" y="0" width="0.5" height="36" fill="var(--grip-line-color)" />
      <rect x="9.5" y="6" width="0.5" height="24" fill="var(--grip-line-color)" />
    </svg>
  </div>
</div>

<style>
  .resize-handle {
    width: 0; /* No width */
    height: 80px; /* Limited height */
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .resize-fab {
    width: 48px;
    height: 48px;
    background-color: rgba(255, 255, 255, 0.00);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    cursor: pointer;
    left: -24px; /* center the larger handle on the boundary */
  }
</style> 