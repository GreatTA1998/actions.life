<script>
  import { chatAvatarVariant } from '$lib/utils/communityChatDisplay.js'

  /** Firebase uid (or any stable id string) — drives variant via hash */
  let {
    uid,
    variant: variantOverride = undefined,
    size = 'md',
    class: className = ''
  } = $props()

  let sizeClass = $derived(
    size === 'sm' ? 'size-6 shrink-0' : 'size-11 shrink-0'
  )

  let imgPadClass = $derived(size === 'sm' ? 'p-px' : 'p-0.5')

  let variant = $derived(
    variantOverride !== undefined && variantOverride !== null
      ? Math.min(9, Math.max(0, Math.floor(Number(variantOverride))))
      : chatAvatarVariant(uid)
  )

  /** Ten hue-rotate steps + light saturate/brightness so each reads distinct */
  const filters = [
    'hue-rotate(0deg) saturate(1.12) brightness(1.03)',
    'hue-rotate(36deg) saturate(1.1) brightness(1.02)',
    'hue-rotate(72deg) saturate(1.14) brightness(1.02)',
    'hue-rotate(108deg) saturate(1.08) brightness(1.03)',
    'hue-rotate(144deg) saturate(1.12) brightness(1.02)',
    'hue-rotate(180deg) saturate(1.1) brightness(1.04)',
    'hue-rotate(324deg) saturate(1.1) brightness(1.03)'
  ]
</script>

<div
  class="flex items-center justify-center overflow-hidden rounded-full bg-neutral-100 shadow-sm ring-1 ring-black/5 {sizeClass} {className}"
>
  <img
    src="/zen-bird.avif"
    alt=""
    class="size-full object-contain {imgPadClass}"
    style="filter: {filters[variant]};"
    draggable="false"
  />
</div>
