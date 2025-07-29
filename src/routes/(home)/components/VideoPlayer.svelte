<script>
  export let videoSrc
  export let poster
  export let isPlaying = false
  export let hasMobilePlayButtonAlready = true
  export let isSoundOff = true

  let VideoElem

  function onVideoLoaded() {
    isPlaying = false
  }

  function togglePlayPause() {
    const video = VideoElem
    if (video.paused || video.ended) {
      video.play()
    } else {
      video.pause()
    }
  }

  // when we switch "src" on <video> playback speed resets, so this is a hack
  $: if (videoSrc) {
    initializeVideo()
  }

  function initializeVideo() {
    setTimeout(
      // timeout necessary as the playback speed resets after video LOAD
      () => {
        if (VideoElem) {
          // during `src` switching, it's not defined instantaneously
          const maxMobilePxWidth = 768
          if (window.innerWidth > maxMobilePxWidth) {
            // iOS will have a play button overlay automatically, so no need to show
            hasMobilePlayButtonAlready = false
          }

          VideoElem.playbackRate = 1.5 // playback rate MUST come after `src`
        }
      },
      0
    )
  }
</script>

<div class="video-container">
  {#if !isPlaying && !hasMobilePlayButtonAlready}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <div
      class="unmute-btn"
      on:click|stopPropagation={() => {
        VideoElem.muted = false
        isSoundOff = false
        VideoElem.play()
      }}
      style="z-index: 1;"
    >
      <span class="material-symbols-outlined" style="font-size: 8vw;">
        play_circle
      </span>
    </div>
  {/if}

  <!-- I learnt to not f*ck with <video>'s default behaviors -->
  <!-- #key is a quickfix as video works on initial load, but not on subsequent `src` changes -->
  {#key videoSrc}
    <!-- svelte-ignore a11y-media-has-caption -->
    <video
      src={videoSrc}
      {poster}
      bind:this={VideoElem}
      playsinline
      controls
      controlslist="nodownload noremoteplayback"
      disablepictureinpicture
      on:play={() => (isPlaying = true)}
      on:pause={() => (isPlaying = false)}
      on:ended={() => (isPlaying = false)}
      on:loadedmetadata={onVideoLoaded}
      style="width: 100%; height: auto;"
    >
    </video>
  {/key}
</div>

<style lang="scss">
  .unmute-btn {
    position: absolute; /* Position the button absolutely within the container */
    top: 50%; /* Vertically center the button */
    left: 50%; /* Horizontally center the button */
    transform: translate(
      -50%,
      -50%
    ); /* Adjust for the button's own dimensions */
    width: 9vw; /* Adjust the size of the button as needed */
    height: 9vw;
    border-radius: 50%; /* Make the button circular */
    background-color: rgba(0, 0, 0, 0.1); /* Semi-transparent background */
    color: white; /* Text color */
    border: none;
    outline: none;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .video-container {
    flex: 0 0 55%;
    width: 100%;
    position: relative;
  }

  @media (max-width: 767.99px) {
    .video-container {
      width: 100%;
    }
  }
</style> 