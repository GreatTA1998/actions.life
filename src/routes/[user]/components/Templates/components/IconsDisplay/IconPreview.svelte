<script>
  import { user } from '$lib/store'
  import IconDetailLayout from './IconDetailLayout.svelte'
  import IconMenu from './IconMenu.svelte'

  let { icon, onClose = () => {} } = $props()

  let canDelete = $derived(icon.createdBy === $user.uid)
</script>

<IconDetailLayout>
  <img
    src={icon.url}
    width="240"
    height="240"
    class="border border-solid border-black"
  />

  {#snippet meta()}
    <div class="flex items-center gap-2 min-w-0">
      <p class="text-lg font-medium truncate">{icon.name}</p>
      {#if canDelete}
        <IconMenu {icon} onDelete={onClose} />
      {/if}
    </div>
    <p class="text-base text-neutral-600">
      {icon.isShareable ? 'Public' : 'Private'}
    </p>
  {/snippet}
</IconDetailLayout>
