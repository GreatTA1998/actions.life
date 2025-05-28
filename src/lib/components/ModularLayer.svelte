<script>
  import { createEventDispatcher } from 'svelte'

  export let zIndex = 3

  const dispatch = createEventDispatcher()
</script>

<div class="fullscreen-invisible-modular-layer" 
  on:click|self={() => dispatch('click-outside')} on:keydown 
  style="z-index: {zIndex};"
>
  <slot>

  </slot>
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
  }
</style>