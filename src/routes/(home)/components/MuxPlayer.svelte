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
</script>

<div class="rounded-xl overflow-hidden">
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