<script>
  import '@mux/mux-player'

  let { 
    playbackID = '',
    title = '',
    onplay = () => {},
    onpause = () => {},
    el = $bindable(null),
    aspectRatio = 16/9,
    thumbnailTime = 0
  } = $props()

  function onclick (e) {
    e.stopPropagation()
    el.paused ? el.play() : el.pause()
  }
</script>

<!-- w-full is required for aspect-ratio to reserve space in advance -->
<div class="relative rounded-xl overflow-hidden w-full">
  <mux-player
    bind:this={el}
    {title}
    playback-id={playbackID}
    thumbnail-time={thumbnailTime}
    accent-color=""
    {onplay}
    {onpause}
    style:aspect-ratio={aspectRatio}
  ></mux-player>

  <div class="absolute inset-0" {onclick}></div>
</div>

<style>
  mux-player {
    display: block; /* common gotcha with tiny gap below video due to inline-block */

    --center-controls: none;

    --seek-backward-button: none;
    --seek-forward-button: none;
    --live-button: none;
    --pip-button: none;
    --airplay-button: none;
    --cast-button: none;
    --volume-range: none;
  }
</style>