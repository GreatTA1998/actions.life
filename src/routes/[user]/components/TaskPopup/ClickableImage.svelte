

<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import PhotoMenuActions from './PhotoMenuActions.svelte'

  let { task, style } = $props()
</script>

<PopoverMenu>
  {#snippet activator ({ open, close, toggle })}
    <img onclick={open} src={task.imageDownloadURL} {style} />
  {/snippet}

  {#snippet content ()}
    <PhotoMenuActions {task} />
  {/snippet}
</PopoverMenu>