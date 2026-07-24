<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import MslMoreVert from 'virtual:icons/material-symbols-light/more-vert'
  import MslDeleteOutline from 'virtual:icons/material-symbols-light/delete-outline'
  import { doodleIcons } from '$lib/store'
  import { getContext } from 'svelte'

  const { Icon } = getContext('app')

  let {
    icon,
    onDelete = () => {},
    extraClass = '',
    fontSize = '1.25rem',
    color = 'var(--fine-control-color)'
  } = $props()

  async function handleDelete (close) {
    if (confirm(`Are you sure you want to delete the ${icon.name} icon?`)) {
      await Icon.delete({ id: icon.id })
      onDelete()
      close()
    }
  }
</script>

<PopoverMenu>
  {#snippet activator ({ id, anchorName })}
    <button
      popovertarget={id}
      style:anchor-name={anchorName}
      style:width="calc(0.75 * {fontSize})"
      style:height={fontSize}
      style:color
      class="{extraClass} overflow-hidden justify-center"
    >
      <div
        style:font-size="calc(1.125 * {fontSize})"
        class="shrink-0 flex items-center"
      >
        <MslMoreVert />
      </div>
    </button>
  {/snippet}

  {#snippet content ({ close })}
    <div class="flex flex-col p-2 gap-y-2 text-base">
      <button
        onclick={() => handleDelete(close)}
        class="text-left gap-x-[6px] text-neutral-600"
      >
        <MslDeleteOutline style="font-size: 1.25rem" />
        Delete
      </button>
    </div>
  {/snippet}
</PopoverMenu>
