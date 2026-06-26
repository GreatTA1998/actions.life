<script>
  import '@mux/mux-player'

  let { 
    playbackID = '',
    title = '',
    onplay = () => {},
    onpause = () => {},
    el = $bindable(null),
    aspectRatio = 16/9,
    thumbnailTime = 0,
    autoplay = false,
    muted = false,
    playsinline = false
  } = $props()
</script>

<!-- w-full is required for aspect-ratio to reserve space in advance -->
<div class="relative w-full rounded-2xl overflow-hidden border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_32px_rgba(80,120,180,0.12)]">
  <mux-player
    bind:this={el}
    {title}
    playback-id={playbackID}
    thumbnail-time={thumbnailTime}
    accent-color=""
    {onplay}
    {onpause}
    {autoplay}
    {muted}
    {playsinline}
    style:aspect-ratio={aspectRatio}
  ></mux-player>
</div>

<style>
  mux-player {
    display: block; /* common gotcha with tiny gap below video due to inline-block */

    --seek-backward-button: none;
    --seek-forward-button: none;
    --live-button: none;
    --pip-button: none;
    --airplay-button: none;
    --cast-button: none;
    --volume-range: none;
  }
</style>