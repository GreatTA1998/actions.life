

<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import PhotoMenuActions from './PhotoMenuActions.svelte'

  let { task, style } = $props()
</script>

<PopoverMenu>
  {#snippet activator ({ id, anchorName })}
    <button popovertarget={id} style:display="contents">
      <img 
        style:anchor-name={anchorName}
        src={task.imageDownloadURL} 
        {style} 
      />
    </button>
  {/snippet}

  {#snippet content ()}
    <PhotoMenuActions {task} />
  {/snippet}
</PopoverMenu>