<script>
  import MuxPlayer from './MuxPlayer.svelte'

  let {
    player = $bindable(null)
  } = $props()
</script>

<div class={['w-8/10 relative flex justify-center']}>
  <MuxPlayer bind:el={player}
    title="Introduction"
    thumbnailTime={290}
    playbackID="h5meva00SxXhSoTj02APSzHbFaHrSdO3ETzpbEKyAuUJQ"
    aspectRatio={15.3/9}
    default-hidden-captions
  />
</div>
