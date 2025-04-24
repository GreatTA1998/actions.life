<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()
</script>

<div on:click|self={() => dispatch('click-outside')} on:keydown class="fullscreen-invisible-modular-popup-layer">
  <div class="detailed-card-popup">
    <slot> 

    </slot>
  </div>
</div>

<style>
  /* fullscreen modular popup is currently a global CSS class */
  
  .detailed-card-popup {
    max-height: 90vh; /* mobile safety, always be able to close the screen */
    min-width: 360px;

    width: 70%;
    height: 90vh;
    overflow-y: auto;
 
    position: fixed;
    z-index: 3;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    font-size: 14px;
    padding: 24px;
    border-radius: 24px;
    background-color: white;

    box-shadow: 0px 0px 0px 9999px rgba(0, 0, 0, 0.5);
  }
</style>