<script>
  let { 
    children,
    listWidth,
    id
  } = $props()
</script>

<div
  style="
    width: {listWidth}px; 
    view-transition-name: list-{id};
    contain: layout;
  "
>
  {@render children()}
</div>

<style>
  /* View Transition API styles for smooth list repositioning 
    Decided on easeInOutCirc
    @see https://emilkowal.ski/ui/7-practical-animation-tips
    @see https://easings.co/
  */
  @supports (view-transition-name: none) {
    ::view-transition-group(*) {
      animation-duration: 0.15s;
      animation-timing-function: cubic-bezier(0.79,0.14,0.15,0.86);
    }

    ::view-transition-old(*),
    ::view-transition-new(*) {
      animation-duration: 0.15s;
      animation-timing-function: cubic-bezier(0.79,0.14,0.15,0.86);
    }
  }
</style>

