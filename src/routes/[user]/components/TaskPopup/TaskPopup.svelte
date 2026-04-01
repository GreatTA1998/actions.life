<script>
  import NewBasePopup from '$lib/components/NewBasePopup.svelte'
  import LayoutDecider from './LayoutDecider.svelte'
  import ClickableImage from './ClickableImage.svelte'
  import Details from './Details.svelte'
  import { getContext } from 'svelte'

  const { tasksCache, clickedTaskID, closeTaskPopup } = getContext('app')
  
  let task = $derived($tasksCache[$clickedTaskID])
</script>

<NewBasePopup onExit={closeTaskPopup}>
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
</NewBasePopup>