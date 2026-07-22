<script>
  import BasicWhiteboard from './BasicWhiteboard.svelte'
  import IconPreview from './IconPreview.svelte'
  import { doodleIcons, user } from '$lib/store'
  import { listenToCollection } from '$lib/db/helpers.js'
  import { db } from '$lib/db/init.js'
  import { query, where, collection, or } from 'firebase/firestore'
  import { onMount } from 'svelte'

  let {
    includePublic = false,
    onChange = (_icon) => {},
    gridClass = ''
  } = $props()

  let selectedIcon = $state(null)
  let drawing = $state(false)

  let icons = $derived.by(() => {
    const all = $doodleIcons || []
    const own = all.filter((icon) => icon.createdBy === $user.uid)
    if (!includePublic) return own
    const pub = all.filter(
      (icon) => icon.isShareable && icon.createdBy !== $user.uid
    )
    return [...own, ...pub]
  })

  onMount(() => {
    return listenToCollection(
      query(
        collection(db, 'icons'),
        or(
          where('isShareable', '==', true),
          where('createdBy', '==', $user.uid)
        )
      ),
      (newVals) => doodleIcons.set(newVals)
    )
  })

  function isSame (a, b) {
    if (!a || !b) return false
    return (a.id && a.id === b.id) || a.url === b.url
  }

  function handleSelectIcon (icon) {
    if (isSame(selectedIcon, icon)) {
      selectedIcon = null
      onChange(null)
      return
    }
    selectedIcon = icon
    drawing = false
    onChange(icon)
  }

  function toggleDrawing () {
    drawing = !drawing
    if (drawing) selectedIcon = null
  }

  function handleSave (icon) {
    drawing = false
    selectedIcon = icon
    onChange(icon)
  }
</script>

<div>
  <div class={['inline-flex max-w-full flex-wrap items-center', gridClass]}>
    {#each icons as icon (icon.id || icon.url)}
      <button
        class={[
          'size-12 shrink-0 transition-transform',
          isSame(selectedIcon, icon) && 'relative z-10 scale-110 drop-shadow-md'
        ]}
        onclick={() => handleSelectIcon(icon)}
      >
        <img src={icon.url} class="size-full" />
      </button>
    {/each}

    <button onclick={toggleDrawing}
      class={[
        'size-12 shrink-0 outline outline-1 outline-dashed outline-current outline-offset-[-6px] transition-transform',
        drawing && 'relative z-10 scale-110 drop-shadow-md'
      ]}
    >
      +
    </button>
  </div>

  {#if selectedIcon}
    <div class="mt-4">
      <IconPreview icon={selectedIcon} onClose={() => {
        selectedIcon = null
        onChange(null)
      }} />
    </div>
  {:else if drawing}
    <div class="mt-4 flex justify-center">
      <BasicWhiteboard onSave={handleSave} />
    </div>
  {/if}
</div>
