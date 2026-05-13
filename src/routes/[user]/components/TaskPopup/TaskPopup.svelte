<script>
  import NewBasePopup from '$lib/components/NewBasePopup.svelte'
  import LayoutDecider from './LayoutDecider.svelte'
  import ClickableImage from './ClickableImage.svelte'
  import Details from './Details.svelte'
  import { getContext } from 'svelte'

  const { closeTaskPopup } = getContext('task-popup')

  let { task } = $props()
</script>

<NewBasePopup onExit={closeTaskPopup}>
  <LayoutDecider {task}>
    {#snippet photo (style)}
      <ClickableImage {task} {style} />
    {/snippet}

    {#snippet info ()}
      <Details {task} />
    {/snippet}
  </LayoutDecider>
</NewBasePopup>