<script>
  let {
    title,
    points,
    activeTime,
    onseek,
    children
  } = $props()

  let isActive = $derived(points.some(p => p.t === activeTime))

  function timestamp (seconds) {
    const mm = Math.floor(seconds / 60)
    const ss = seconds % 60
    return `${mm}:${ss.toString().padStart(2, '0')}`
  }
</script>

<div class={[
  'flex flex-col w-[360px] py-4 px-2 gap-y-2 rounded-2xl border',
  isActive
    ? 'bg-[#fafafa] border-[#e0d9cf]'
    : 'bg-[#edf1f6] border-[#a0c8f02e]'
]}>
  <button
    onclick={e => onseek(points[0].t, e)}
    class="flex w-full shrink-0 items-center justify-start gap-x-2 px-2 h-8 min-h-8"
    type="button"
  >
    <p class="text-md font-medium text-neutral-800">{title}</p>
    <div class="flex items-center justify-end gap-1.5 self-stretch max-h-full">
      {@render children?.()}
    </div>
  </button>

  <p class="px-2 m-0 text-sm leading-[1.6] text-neutral-600">
    {#each points as p, i (p.t)}
      {@const active = p.t === activeTime}
      <span
        role="button"
        tabindex="0"
        onclick={e => onseek(p.t, e)}
        onkeydown={e => e.key === 'Enter' && onseek(p.t, e)}
        class={['cursor-pointer rounded-[3px] transition-colors', active && 'text-neutral-600']}
      >{p.label} <span class={active ? 'text-[#065fd4]' : 'text-black/[0.28]'}>({timestamp(p.t)})</span></span>{i < points.length - 1 ? '. ' : '. '}
    {/each}
  </p>
</div>
