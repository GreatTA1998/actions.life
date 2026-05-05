<script>
  import MuxPlayer from './MuxPlayer.svelte'

  let {
    player = $bindable(null)
  } = $props()
</script>

<div class={['w-8/10 relative flex justify-center']}>
  <MuxPlayer bind:el={player}
    title="Tutorial"
    thumbnailTime={221}
    playbackID="I94NCWZHUcVY3NXS1LStz4n5FDUMKAETB600nTfIwxTw"
    aspectRatio={13.85/9}
    onplay={() => showTranscript = false}
    onpause={() => showTranscript = true}
  />
</div>