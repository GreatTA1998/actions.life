<script>
  let {
    title,
    points,
    active = false,
    onseek,
    t
  } = $props()

  function timestamp (seconds) {
    const mm = Math.floor(seconds / 60)
    const ss = seconds % 60
    return `${mm}:${ss.toString().padStart(2, '0')}`
  }
</script>

<button type="button"
  onclick={e => onseek(points[0].t, e)}
  class={[
    'flex w-full flex-col items-start justify-start rounded-xl px-4 py-1.5 md:py-3 text-left md:gap-1.5',
    'border border-white/70 bg-white/45 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_32px_rgba(80,120,180,0.12)]',
    active && 'border-blue-300/60 bg-white/65 shadow-[inset_0_1px_0_white,0_0_0_1px_rgba(59,130,246,0.12),0_10px_36px_rgba(59,130,246,0.15)]',
  ]}
>
  <span class="flex min-h-6 w-full shrink-0 flex-wrap items-center justify-start gap-x-1.5 md:min-h-7 md:h-7 md:gap-x-2">
    <span class={['text-sm md:text-base font-semibold leading-tight', active ? 'text-blue-700' : 'text-neutral-900']}>
      {title}
    </span>
    <span class={['text-xs md:text-sm leading-tight', active ? 'text-blue-700' : 'text-[#065fd4]']}>
      ({timestamp(t)})
    </span>
  </span>

  <span class="text-xs md:text-sm text-[#0f0f0f] leading-snug text-neutral-700">
    {#each points as p (p.t)}
      {p.label}
    {/each}
  </span>
</button>