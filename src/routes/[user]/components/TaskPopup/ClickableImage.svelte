

<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import PhotoMenuActions from './PhotoMenuActions.svelte'

  let { task, style } = $props()
</script>

<PopoverMenu>
  {#snippet activator ({ id, anchorName })}
    <button style:display="contents" popovertarget={id} style:anchor-name={anchorName}>
      <img {style} 
        src={task.imageDownloadURL} 
      />
    </button>
  {/snippet}

  {#snippet content ()}
    <PhotoMenuActions {task} />
  {/snippet}
</PopoverMenu>