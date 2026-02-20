<script>
  import ModularLayer from '$lib/components/ModularLayer.svelte'

  let { 
    zIndex = 3, 
    padding = 24, 
    onClickOutside = () => {},
    children 
  } = $props()
</script>

<ModularLayer {zIndex} {onClickOutside}>
  <div class="detailed-card-popup" style="z-index: {zIndex}; padding: {padding}px">
    {@render children()}
  </div>
</ModularLayer>

<style>
  .detailed-card-popup {
    max-height: 80dvh; /* mobile safety, always be able to close the screen */
    min-width: 360px;

    width: 100%;
    overflow-y: auto;
 
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    font-size: 14px;
    border-radius: 24px;
    background-color: var(--surface-1);

    box-shadow: 0px 0px 0px 9999px rgba(0, 0, 0, 0.8);
  }

  @media (min-width: 768px) {
    .detailed-card-popup {
      width: 768px;
    }
  }
</style>