<script>
  let { src = '', title, body } = $props()

  let failed = $state(false)
  const showVideo = $derived(!!src && !failed)

  function playSilent (node) {
    node.muted = true
    const play = () => node.play().catch(() => {})
    play()
    node.addEventListener('canplay', play)
    return () => {
      node.removeEventListener('canplay', play)
      node.pause()
    }
  }
</script>

<article class="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-[1.75rem] bg-black/[0.045]">
  <div class="relative aspect-[5/4] overflow-hidden">
    {#if showVideo}
      <video
        {@attach playSilent}
        {src}
        muted
        loop
        playsinline
        autoplay
        disablepictureinpicture
        onerror={() => failed = true}
        class="size-full object-cover"
      ></video>
    {:else}
      <div class="placeholder size-full"></div>
    {/if}
  </div>

  <div class="relative z-1 flex flex-col gap-1.5 px-5 pb-6 pt-4">
    <h3 class="m-0 text-[1.05rem] font-semibold tracking-tight text-gray-800">{title}</h3>
    <p class="m-0 text-sm leading-snug text-gray-500">{body}</p>
  </div>

  <div class="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-neutral-500/15 to-transparent"></div>
</article>

<style>
  .placeholder {
    background:
      linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.45) 50%, transparent 70%),
      repeating-linear-gradient(-8deg, #d8dce2 0 28%, #cfd4db 28% 32%, #d8dce2 32% 100%);
    background-size: 220% 100%, 100% 100%;
    animation: sweep 4.5s ease-in-out infinite;
  }

  @keyframes sweep {
    from { background-position: 120% 0, 0 0; }
    to { background-position: -20% 0, 0 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .placeholder { animation: none; }
  }
</style>
