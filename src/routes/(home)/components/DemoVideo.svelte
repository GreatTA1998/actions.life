<script>
  import MuxPlayer from './MuxPlayer.svelte'

  let {
    player = $bindable(null)
  } = $props()
</script>

<div class={['w-8/10 relative flex justify-center']}>
  <MuxPlayer bind:el={player}
    title="Introduction"
    thumbnailTime={489}
    playbackID="MEMiWk4a1RIjjveNPPOUeap9A00U00q7lCDRmpJn2RZ1A"
    aspectRatio={15.3/9}
    default-hidden-captions
  />
</div>
