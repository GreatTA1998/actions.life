<script>
  let {
    title,
    points,
    activeTime,
    onseek,
    t
  } = $props()

  let isActive = $derived(points.some(p => p.t === activeTime))

  function timestamp (seconds) {
    const mm = Math.floor(seconds / 60)
    const ss = seconds % 60
    return `${mm}:${ss.toString().padStart(2, '0')}`
  }
</script>

<div onclick={e => onseek(points[0].t, e)} 
  class={[
    'flex flex-col border',
    'overlay-glass w-full py-1.5 px-2 md:px-4 md:py-3 gap-y-0 md:gap-y-1.5 rounded-xl bg-white/90 backdrop-blur-sm',
    'border-white/80',
    isActive ? 'bg-[#fafafa] border-[#e0d9cf]' : 'bg-[#edf1f6] border-[#a0c8f02e]'
  ]}
>
  <button class={['w-full shrink-0 justify-start gap-x-2 flex-wrap', 'min-h-7 md:h-7']}>
    <p class="text-left text-xs md:text-base font-semibold text-neutral-900">
      {title}
    </p>
    <span class="text-xs md:text-sm text-[#065fd4]">
      ({timestamp(t)})
    </span>
  </button>

  <p class="hidden md:block m-0 text-[15px] leading-[1.45] text-neutral-800">
    {#each points as p, i (p.t)}
      {@const active = p.t === activeTime}
      <span
        tabindex="0"
        onclick={e => onseek(p.t, e)}
        class={['rounded-[3px] transition-colors', active && 'text-neutral-600']}
      >{p.label} </span>{i < points.length - 1 ? '. ' : '. '}
    {/each}
  </p>
</div>