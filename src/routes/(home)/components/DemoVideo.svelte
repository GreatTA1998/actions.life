<script>
  import MuxPlayer from './MuxPlayer.svelte'

  let {
    player = $bindable(null)
  } = $props()
</script>

<div class={['w-8/10 relative flex justify-center']}>
  <MuxPlayer bind:el={player}
    title="Introduction"
    thumbnailTime={221}
    playbackID="pT200rx1N01x02vDqcUNnshYqAGdGKJBFKLY2Gk01jtpSrc"
    aspectRatio={16.25/9}
  />
</div>