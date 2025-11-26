<script>
  let { zIndex = 3, onClickOutside = () => {}, children } = $props()
</script>

<div 
  onclick={e => { 
    if (e.target === e.currentTarget) {
      onClickOutside()
    }
  }}
  class="fullscreen-invisible-modular-layer" 
  style="z-index: {zIndex};"
> 
  {@render children()}
</div>

<style>
  /* Prevent accidentally trigger click on other elements e.g. accidentally creating a new task on the calendar when you're just trying to exit */
  .fullscreen-invisible-modular-layer {
    view-transition-name: task-popup; 
    contain: layout;

    width: 100vw; 
    height: 100vh; 
    position: fixed; 
    top: 0; 
    left: 0; 
    background: transparent; 
  }
</style>