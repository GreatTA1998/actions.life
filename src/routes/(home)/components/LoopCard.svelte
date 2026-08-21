<script>
  import '@mux/mux-player'

  let { playbackID = '', aspectRatio = 16 / 9 } = $props()

  let failedFor = $state(null)
  const showVideo = $derived(!!playbackID && failedFor !== playbackID)
</script>

<div
  class="loop-card relative self-start overflow-hidden rounded-2xl border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_32px_rgba(80,120,180,0.12)]"
  style:width={`min(100%, calc(32rem * ${aspectRatio}))`}
  style:aspect-ratio={aspectRatio}
>
  {#if showVideo}
    <mux-player
      playback-id={playbackID}
      muted
      loop
      autoplay="muted"
      nohotkeys
      playsinline
      max-resolution="720p"
      onerror={() => failedFor = playbackID}
      class="block size-full"
      style:aspect-ratio={aspectRatio}
    ></mux-player>
  {:else}
    <div class="placeholder size-full"></div>
  {/if}
</div>

<style>
  .loop-card {
    height: auto;
    max-height: 32rem;
    flex-shrink: 0;
  }

  mux-player {
    display: block;
    --controls: none;
    --media-object-fit: contain;
    --media-background-color: transparent;
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
