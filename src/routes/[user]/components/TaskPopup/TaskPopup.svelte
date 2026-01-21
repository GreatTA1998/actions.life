<script>
  import LayoutDecider from './LayoutDecider.svelte'
  import ClickableImage from './ClickableImage.svelte'
  import TaskInfo from './TaskInfo.svelte'
  import { getContext } from 'svelte'

  const { tasksCache, clickedTaskID, closeTaskPopup } = getContext('app')

  let taskObject = $derived($tasksCache[$clickedTaskID])

  function ontoggle (e) {
    if (e.newState === 'closed') closeTaskPopup()
  }

  function onclick (e) {
    if (e.target === e.currentTarget) {
      closeTaskPopup()
    }
  }
</script>

<dialog {ontoggle} {onclick} id="task-dialog" class="hide-scrollbar" style="background: var(--offwhite-bg);">
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
</dialog>

<style>
  dialog {
    padding: 0;
    border: none;
    border-radius: 24px;
  }

  ::backdrop {
    background-color: rgb(80, 80, 80); 
  }

  dialog:-internal-dialog-in-top-layer {
    max-height: 100%;
    max-width: 100%;
  }

  :focus-visible {
    outline: unset;
  }
</style>