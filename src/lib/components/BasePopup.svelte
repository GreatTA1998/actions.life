<script>
  import { createEventDispatcher } from 'svelte'

  export let zIndex = 3
  export let padding = 24

  const dispatch = createEventDispatcher()
</script>

<div class="fullscreen-invisible-modular-layer" on:click|self={() => dispatch('click-outside')} on:keydown>
  <div class="detailed-card-popup" style="z-index: {zIndex}; padding: {padding}px">
    <slot> 

    </slot>
  </div>
</div>

<style>
  /* Prevent accidentally trigger click on other elements e.g. accidentally creating a new task on the calendar when you're just trying to exit */
  .fullscreen-invisible-modular-layer {
    width: 100vw; 
    height: 100vh; 
    position: fixed; 
    top: 0; 
    left: 0; 
    background: transparent; 
    z-index: 2;
  }

  .detailed-card-popup {
    max-height: 90dvh; /* mobile safety, always be able to close the screen */
    min-width: 360px;

    width: 100%;
    overflow-y: auto;
 
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    font-size: 14px;
    border-radius: 24px;
    background-color: white;

    box-shadow: 0px 0px 0px 9999px rgba(0, 0, 0, 0.5);
  }

  @media (min-width: 768px) {
    .detailed-card-popup {
      width: 70%;
    }
  }
</style>