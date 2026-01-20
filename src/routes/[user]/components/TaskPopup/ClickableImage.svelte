

<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import PhotoMenuActions from './PhotoMenuActions.svelte'

  let { taskObject, style } = $props()
</script>

<PopoverMenu>
  {#snippet activator ({ open, close, toggle })}
    <img onclick={open} src={taskObject.imageDownloadURL} {style} />
  {/snippet}

  {#snippet content ()}
    <PhotoMenuActions {taskObject} />
  {/snippet}
</PopoverMenu>