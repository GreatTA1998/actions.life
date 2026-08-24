<script>
  import '@mux/mux-player'

  let {
    playbackID = '',
    aspectRatio = 16 / 9,
    playing = false,
    platform = '',
    Icon,
    ontoggle
  } = $props()

  let failedFor = $state(null)
  let started = $state(false)
  const showMedia = $derived(!!playbackID && failedFor !== playbackID)
  const showPoster = $derived(!playing || !started)
  const poster = $derived(
    `https://image.mux.com/${playbackID}/thumbnail.webp?width=1200&fit_mode=preserve`
  )

  function toggle() {
    started = false
    ontoggle?.()
  }
</script>

<div
  class="loop-card relative overflow-hidden rounded-[1.25rem] border border-black/[0.06] bg-[#e8eaee] shadow-[0_8px_28px_rgba(0,0,0,0.08)]"
  style:--ratio={aspectRatio}
>
  {#if showMedia}
    {#if playing}
      <mux-player
        playback-id={playbackID}
        muted
        autoplay="muted"
        loop
        nohotkeys
        playsinline
        max-resolution="720p"
        onplaying={() => started = true}
        onerror={() => failedFor = playbackID}
        class="media"
      ></mux-player>
    {/if}

    {#if showPoster}
      <img
        src={poster}
        alt=""
        class="media object-cover"
        onerror={() => failedFor = playbackID}
      />
    {/if}

    {#if platform && Icon}
      <span
        class="pointer-events-none absolute top-2 left-2 z-1 inline-flex items-center gap-1.5 rounded-full bg-[#595959]/80 px-2 py-1 text-[11px] leading-none font-medium tracking-[-0.01em] text-white"
      >
        <Icon class="size-3.5 shrink-0" />
        {platform}
      </span>
    {/if}

    <button
      type="button"
      onclick={toggle}
      class="group absolute inset-0 grid cursor-pointer place-items-center border-0 bg-transparent p-0"
    >
      {#if !playing}
        <span
          class="grid size-14 place-items-center rounded-full bg-[#595959]/80"
        >
          <svg class="ml-0.5 size-[26px] text-white" viewBox="0 0 10 12">
            <path d="M0 0v12l10-6z" fill="currentColor" />
          </svg>
        </span>
      {/if}
    </button>
  {:else}
    <div class="placeholder"></div>
  {/if}
</div>

<style>
  .loop-card {
    --max-h: 28rem;
    width: min(calc(100vw - 2 * clamp(1rem, 5vw, 4rem)), calc(var(--max-h) * var(--ratio)));
    aspect-ratio: var(--ratio);
    flex-shrink: 0;
  }

  @media (min-width: 768px) {
    .loop-card {
      --max-h: min(22rem, 26vw);
    }
  }

  .media,
  .placeholder {
    position: absolute;
    inset: 0;
    display: block;
    width: 100%;
    height: 100%;
  }

  mux-player {
    --controls: none;
    --media-object-fit: cover;
    --media-background-color: transparent;
    aspect-ratio: unset;
  }

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
