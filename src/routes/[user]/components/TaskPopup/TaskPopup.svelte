<script>
  import ModularLayer from '$lib/components/ModularLayer.svelte'
  import LayoutDecider from './LayoutDecider.svelte'
  import ClickableImage from './ClickableImage.svelte'
  import Details from './Details.svelte'
  import { getContext } from 'svelte'

  const { tasksCache, clickedTaskID, closeTaskPopup } = getContext('app')

  const zIndex = 3
  
  let task = $derived($tasksCache[$clickedTaskID])
</script>

<svelte:window onkeydown={(e) => {
  if (e.key === 'Escape' && !document.querySelector(':popover-open')) {
    closeTaskPopup()
  }
}} />

<ModularLayer {zIndex} onClickOutside={closeTaskPopup}>
  <div id="task-popup"
    class="base-popup hide-scrollbar" 
    style:z-index={zIndex}
    style:view-transition-name="task-popup"
    style:view-transition-class="static-ui"
  >
    {#if task}
      <LayoutDecider {task}>
        {#snippet photo (style)}
          <ClickableImage {task} {style} />
        {/snippet}

        {#snippet info ()}
          <Details />
        {/snippet}
      </LayoutDecider>
    {/if}
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