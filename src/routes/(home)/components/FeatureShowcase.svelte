<script>
  import VideoPlayer from './VideoPlayer.svelte'
  
  export let currentFeature
  export let isPlaying = false
  export let hasMobilePlayButtonAlready = true
  export let isSoundOff = true
</script>

<div class="feature-showcase-container">
  <VideoPlayer 
    videoSrc={currentFeature.videoSrc}
    poster={currentFeature.poster}
    bind:isPlaying
    bind:hasMobilePlayButtonAlready
    bind:isSoundOff
  />

  <div class="explanatory-card">
    <div class="card-description">
      {currentFeature.description}
    </div>
  </div>
</div>

<style lang="scss">
  .feature-showcase-container {
    display: flex;
    justify-content: space-between;
    margin-top: 1vw;
  }

  .explanatory-card {
    flex: 0 0 45%;
    height: auto; // 528px
    background-color: rgb(252, 243, 235);
    padding: 2vw;
  }

  .card-description {
    font-size: 1.3vw;
    padding: 0.5vw;
    white-space: pre-line; // preserves line breaks
    font-weight: 400;
    line-height: 1.4;
  }

  @media (max-width: 360px) {
    .explanatory-card {
      zoom: 30%;
    }
  }

  @media (max-width: 767.99px) {
    .feature-showcase-container {
      flex-direction: column;
      margin-top: 12px;
    }

    .explanatory-card {
      width: 100%;
    }

    .card-description {
      font-size: 12px;
    }
  }
</style> 