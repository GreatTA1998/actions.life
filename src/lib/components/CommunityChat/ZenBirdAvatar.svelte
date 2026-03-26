<script>
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import {
    AVATAR_FILTERS
  } from '$lib/components/CommunityChat/nicknameAndAvatar.js'

  let {
    avatarFilter = AVATAR_FILTERS[0],
    size = 'md',
    class: className = ''
  } = $props()

  let sizeClass = $derived(size === 'sm' ? 'size-6' : 'size-11')
</script>

<PopoverMenu>
  {#snippet activator({ id, anchorName })}
    <!-- `popovertarget` set to nothing, because the popover is only for previewing new color filters -->
    <button
      popovertarget=""
      style:anchor-name={anchorName}
      class="flex items-center justify-center overflow-hidden rounded-full bg-neutral-100 shadow-sm ring-1 ring-black/5 {sizeClass} {className}"
    >
      <img src="/zen-bird.avif" style:filter={avatarFilter}/>
    </button>
  {/snippet}

  {#snippet content ()}
    <div class="flex gap-x-1 py-1 px-2">
      {#each AVATAR_FILTERS as filter, i (i)}
        <button
          class="flex items-center justify-center overflow-hidden rounded-full bg-neutral-100 shadow-sm ring-1 ring-black/5 {sizeClass} {className}"
        >
          <img src="/zen-bird.avif" style:filter />
        </button>
      {/each}
    </div>
  {/snippet}
</PopoverMenu>