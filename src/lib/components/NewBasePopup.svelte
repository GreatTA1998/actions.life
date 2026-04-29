<script module>
  let highest = 0
</script>

<script>
  import ModularLayer from '$lib/components/ModularLayer.svelte'
  import { onMount } from 'svelte'

  let { 
    onExit,
    children
  } = $props()  

  let currentLayer

  onMount(() => {
    currentLayer = ++highest
    return () => highest--
  })
</script>

<svelte:window onkeydown={e => {
  if (e.key === 'Escape') {
    if (!document.querySelector(':popover-open') && highest === currentLayer) {
      onExit()
    }
  }
}} />

<ModularLayer onClickOutside={onExit}>
  <div class="base-popup hide-scrollbar" 
    style:view-transition-name="task-popup"
    style:view-transition-class="static-ui"
  >
    {@render children()}
  </div>
</ModularLayer>

<style>
  .base-popup {
    width: fit-content;
    height: fit-content;
    max-height: 100dvh;
    overflow-y: auto;
 
    position: fixed;
    margin: auto;
    inset: 0;

    border-radius: 24px;
    background: var(--navbar-bg-color);

    box-shadow: 0px 0px 0px 9999px rgba(0, 0, 0, 0.8);
  }
</style>