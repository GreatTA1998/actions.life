<script>
  import ModularLayer from '$lib/components/ModularLayer.svelte'
  import LayoutDecider from './LayoutDecider.svelte'
  import ClickableImage from './ClickableImage.svelte'
  import TaskInfo from './TaskInfo.svelte'
  import { isInputActive } from '$lib/store/popoverInput.js'
  import { getContext } from 'svelte'

  const { tasksCache, clickedTaskID, closeTaskPopup } = getContext('app')

  const zIndex = 3
  let taskObject = $derived($tasksCache[$clickedTaskID])
</script>

<svelte:window onkeydown={(e) => {
  if (e.key === 'Escape' && !$isInputActive) closeTaskPopup()
}} />

<ModularLayer {zIndex} onClickOutside={closeTaskPopup}>
  <div 
    id="task-popup"
    class="base-popup hide-scrollbar" 
    style="
      z-index: {zIndex};
      view-transition-name: task-popup;
      view-transition-class: static-ui;
    "
  >
    {#if taskObject}
      <LayoutDecider {taskObject}>
        {#snippet photo (style)}
          <ClickableImage {taskObject} {style} />
        {/snippet}

        {#snippet info ()}
          <TaskInfo />
        {/snippet}
      </LayoutDecider>
    {/if}
  </div>
</ModularLayer>

<style>
  .base-popup {
    width: fit-content;
    height: fit-content;
    overflow-y: auto;
 
    position: fixed;
    margin: auto;
    inset: 0;

    border-radius: 24px;
    background: var(--navbar-bg-color);

    box-shadow: 0px 0px 0px 9999px rgba(0, 0, 0, 0.8);
  }
</style>