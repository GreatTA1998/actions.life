

<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import PhotoMenuActions from './PhotoMenuActions.svelte'

  let { task, style } = $props()
</script>

<PopoverMenu>
  {#snippet activator ({ popovertarget })}
    <button style:display="contents" {popovertarget}>
      <img {style} 
        src={task.imageDownloadURL} 
        style:anchor-name="--anchor-{popovertarget}"
      />
    </button>
  {/snippet}

  {#snippet content ()}
    <PhotoMenuActions {task} />
  {/snippet}
</PopoverMenu>