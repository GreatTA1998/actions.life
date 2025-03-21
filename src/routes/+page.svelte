<script>
  import LoginGoogle from '$lib/Reusable/LoginGoogle.svelte'
  import { hasFetchedUser } from '/src/store'
  import { onMount } from 'svelte'
  import NavbarContentLayout from '$lib/Reusable/NavbarContentLayout.svelte'

  let isSoundOff = true
  let VideoElem
  let isPlaying = false
  let hasMobilePlayButtonAlready = true

  onMount(() => {
    
  })

  // when we switch "src" on <video> playback speed resets, so this is a hack
  $: if (currentIdx || currentIdx === 0) {
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

          // VideoElem.src = fourAbilities[currentIdx].videoSrc
          VideoElem.playbackRate = 1.5 // playback rate MUST come after `src`
        }
      },
      0
    )
  }

  let currentIdx = 0

  // notice the `#t=0.1` trick we use to solve the iOS not previewing video issue
  let fourAbilities = [
    {
      videoSrc:
        'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/homePageDemoVideos%2Ffeature-1.mp4?alt=media&token=4bc3e4c2-778a-4ece-ae6a-604cc60e98ce',
      poster:
        'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/homePageDemoVideos%2Fthumbnail%201%20of%204.png?alt=media&token=cd74d9c6-4a97-4919-b7c3-77525499f7d5',
      title: '1. Branching Todo',
      subtitle: 'No more long, messy lists',
      iconName: 'house',
      description: `By default, you have a todo-list and calendar together.

                    The todo-list can branch indefinitely, making it easy to re-organize your to-do list into a few readable categories rather than a long linear list.
                    
                    You can drag any task from the todo-list to the calendar.
                   `
    },
    {
      videoSrc:
        'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/homePageDemoVideos%2Ffeature-2.mp4?alt=media&token=7ca4101e-094e-474f-b373-82d1bc170791',
      poster:
        'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/homePageDemoVideos%2Fthumbnail%202%20of%204.png?alt=media&token=2b681735-89dc-4e28-921d-5a9a6767cf91',
      title: '2. Reusable Tasks',
      subtitle: 'Configure sustainable routines',
      iconName: 'restart_alt',
      description: `You can configure all your routines on the same page. 

        Once configured, reusable tasks can be created quickly with autocomplete, be displayed as compact icons (paid feature) and be tracked with time-spent statistics.
        `
    },
    {
      videoSrc:
        'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/homePageDemoVideos%2Ffeature-3.mp4?alt=media&token=a453c7db-ca83-4f26-9e5d-895ed35fb66e',
      poster:
        'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/homePageDemoVideos%2Fthumbnail%203%20of%204.png?alt=media&token=a8175152-e626-4113-858c-ab8e46fa2ec0',
      title: '3. UNCERTAIN GOALS',
      subtitle: 'Visualize tried paths',
      iconName: 'sports_score',
      description: `Many tasks involve many unforeseen steps and difficulties. By tracking the paths, not only do you not forget to follow-up with pending steps, you are more likely to persevere when you can visualize all the things you attempted. 

      You can drag entire-subtrees to forge a rich, tree-like history for your most long-term endeavors.
      `
    },
    {
      videoSrc:
        'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/homePageDemoVideos%2Ffeature-4.mp4?alt=media&token=a41910a8-043b-43a5-948a-4ee6fa9c1668',
      poster:
        'https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/homePageDemoVideos%2Fthumbnail%204%20of%204.png?alt=media&token=0d6e2f82-668a-44fa-9f84-1780d9711de8',
      title: '4. TIMELY PHOTOS',
      subtitle: 'Enjoy the scenery',
      iconName: 'image',
      description: `Display photos directly on your calendar - they often encapsulate a lot of practical information. 
      
      More importantly, the calendar provides context - what were you doing before and after, what did you write about this photo at the time. These memories become your calendar's scenery.
      `
    }
  ]

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

  function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }
</script>

{#if hasFetchedUser}
  <NavbarContentLayout>
    <div
      slot="navbar"
      class="top-navbar transparent-glow-navbar"
      style="background: rgb(250, 250, 250); border-bottom: 1px solid lightgrey;"
    >
      <!-- svelte-ignore a11y-missing-attribute -->
      <img
        src="/trueoutput-square-nobg.png"
        style="margin-left: 0vw; width: 38px; height: 38px;"
      />

      <div style="margin-left: auto; margin-right: 12px;">
        <a
          href="https://github.com/GreatTA1998/intentions.life"
          target="_blank"
          rel="noreferrer"
          style="color: black; background-color: transparent; text-decoration-color: transparent; border: 0px solid black;"
        >
          Github
        </a>
      </div>
    </div>

    <div
      slot="content"
      style="display: flex; flex-grow: 1; height: 100%; padding: 2.5%; padding-top: 1%;"
      class="home-page-background"
    >
      <div
        style="width: 90vw; min-width: 200px; height: 80vh; border-radius: 10px;"
      >
        <div class="hero-title">A modern calendar for organizing life</div>

        <div
          style="display: flex; margin-top: 0.5vw; flex-wrap: wrap; gap: 2vw;"
        >
          <div class="secondary-description">
            intentions.life is a calendar app that helps you sustain small
            habits towards large, uncertain goals.
          </div>

          <div
            style="display: flex; align-items: center; flex-wrap: wrap; gap: 12px 0px;"
            class="action-buttons"
          >
            <LoginGoogle />
          </div>
        </div>

        <div class="my-tab-container">
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            class="my-tab-item"
            on:click={() => (currentIdx = 0)}
            class:my-active-tab={currentIdx === 0}
          >
            <span class="material-symbols-outlined my-tab-icon"> park </span>
            <div class="my-tab-name">Branching To-do</div>
          </div>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            class="my-tab-item"
            on:click={() => (currentIdx = 1)}
            class:my-active-tab={currentIdx === 1}
          >
            <span class="material-symbols-outlined my-tab-icon">
              restart_alt
            </span>
            <div class="my-tab-name">Reusable Tasks</div>
          </div>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            class="my-tab-item"
            on:click={() => (currentIdx = 2)}
            class:my-active-tab={currentIdx === 2}
          >
            <span class="material-symbols-outlined my-tab-icon">
              sports_score
            </span>
            <div class="my-tab-name">Uncertain Goals</div>
          </div>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <div
            class="my-tab-item"
            on:click={() => (currentIdx = 3)}
            class:my-active-tab={currentIdx === 3}
          >
            <span class="material-symbols-outlined my-tab-icon"> Photo </span>
            <div class="my-tab-name">Contextual Photos</div>
          </div>
        </div>

        <div class="feature-showcase-container">
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
            {#key currentIdx}
              <!-- svelte-ignore a11y-media-has-caption -->
              <video
                src={fourAbilities[currentIdx].videoSrc}
                poster={fourAbilities[currentIdx].poster}
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

          <div class="explanatory-card">
            <div class="card-description">
              {fourAbilities[currentIdx].description}
            </div>
          </div>
        </div>

        <div
          style="text-align: center; padding-top: 12vw; padding-bottom: 4vw;"
        >
          <div class="screenshot-caption">
            Example screenshot of my calendar
          </div>
          <!-- svelte-ignore a11y-missing-attribute -->
          <img
            style="max-width: 80%; opacity: 1; filter: blur(0px); height: auto;"
            src="https://firebasestorage.googleapis.com/v0/b/project-y-2a061.appspot.com/o/homePageDemoVideos%2Fmy-screenshot-for-showcase.png?alt=media&token=9800c22f-875b-4df7-b364-2a122e22c842"
          />
        </div>
      </div>
    </div>
  </NavbarContentLayout>
{/if}

<style lang="scss">
  .screenshot-caption {
    margin-bottom: 1vw;
    font-size: 1.2vw;
    font-weight: 500;
  }

  .my-tab-item {
    width: 16vw;
    border-bottom: 0.3vw solid rgb(219, 219, 219);
    font-weight: 500;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    padding: 0.5vw;
    cursor: pointer;
    color: rgb(120, 120, 120);
  }

  .my-active-tab {
    border-bottom: 0.3vw solid var(--logo-twig-color);
    color: var(--logo-twig-color);
    font-weight: 600;
  }

  .my-tab-name {
    margin-left: 0.2vw;
    font-size: 1.3vw;
    text-align: center;
  }

  .my-tab-container {
    display: flex;
    margin-top: 3vw;
  }

  .my-tab-icon {
    font-size: 2.5vw;
    font-weight: 600;
  }

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

  :root {
    --ability-showcase-bg-color: rgb(0, 0, 0);
  }

  .active-thumbnail {
    border: 0.2vw solid var(--logo-twig-color);
    box-shadow: 0 1.5vw 3vw 0.5vw rgba(148, 90, 35, 1);
  }

  .inactive-thumbnail {
    box-shadow: 0 1.5vw 3vw 0.5vw rgb(143, 143, 143);
  }

  .home-page-background {
    background-color: rgb(250, 250, 250);
  }

  .abilities-container {
    position: absolute;

    // https://stackoverflow.com/a/37413510/7812829
    // center horizontally
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;

    top: auto;
    // outline: 4px solid purple;
    width: 34vw;
    bottom: -4.5vw;

    display: flex;
    justify-content: space-evenly;
    align-items: center;
  }

  .ability-square {
    // background-color: var(--ability-showcase-bg-color);
    background-color: white;
    width: 6.5vw;
    height: 6.5vw;
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ability-icon {
    font-size: 4.8vw;
  }

  .feature-showcase-container {
    display: flex;
    justify-content: space-between;
    margin-top: 1vw;
  }

  .video-container {
    flex: 0 0 55%;
    width: 100%;
    position: relative;
  }

  .explanatory-card {
    flex: 0 0 45%;
    height: auto; // 528px
    background-color: rgb(252, 243, 235);
    padding: 2vw;
  }

  .card-title {
    font-size: 2.4vw;
    font-weight: 500;
    color: white;
    text-transform: uppercase;
  }

  .card-subtitle {
    font-size: 1.7vw;
    font-weight: 300;
    color: rgb(250, 250, 250);
  }

  .card-description {
    font-size: 1.3vw;
    // margin-top: 1.8vw;
    padding: 0.5vw;
    white-space: pre-line; // preserves line breaks
    // color: rgb(255, 255, 255);
    font-weight: 400;
    line-height: 1.4;
    // font-style: italic;
  }

  @media (max-width: 360px) {
    .explanatory-card {
      zoom: 30%;
    }
  }

  .transparent-glow-navbar {
    background-color: rgba(150, 150, 150, 0.1);
    border-bottom: none;
  }

  .highlighted-words {
    font-weight: 600;
    display: inline;
  }

  #background-image-holder {
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-color: rgb(235, 235, 235);
    /* background-image: linear-gradient(rgba(255, 255, 255, 0.91), rgba(255, 255, 255, 0.5)), 
      url('https://i.imgur.com/ShnqIpJ.jpeg'); */

    /* background-image: url('maplestory-orange.jpg'); */
    /* background-image: url('https://i.imgur.com/ShnqIpJ.jpeg'); */
  }

  a {
    flex: 1;
    background-color: #333;
    color: #fff;
    border: 1px solid;
    padding: 0.5rem;
    text-align: center;
    text-decoration: none;
    transition: all 0.5s ease-out;
  }

  a:hover,
  a:focus {
    background-color: #fff;
    color: #333;
  }

  .secondary-description {
    font-weight: 500;
    display: inline;
    color: rgb(100, 100, 100);
    font-size: 1.8vw;
    max-width: 800px;
    line-height: 1.3;
    margin-top: 1vw;
  }

  .hero-title {
    color: rgb(60, 60, 60);
    font-size: 3rem;
    font-weight: 600;
  }

  // note there will be a 1px boundary condition that causes an error, however,
  // Kevin Powell's inequality syntax doesn't work for now https://youtube.com/shorts/mrzA2B5gUmI?si=J4yAzq1EQO-BwlN9

  // less than or equal to 768px
  @media (max-width: 1279.99px) {
    .hero-title {
      font-size: 7vw;
    }

    .action-buttons {
      margin-top: 3vw;
    }
  }

  // Anything below 768 is considered a mobile device
  @media (max-width: 767.99px) {
    .secondary-description {
      font-size: 16px;
      margin-top: 8px;
    }

    .hero-title {
      margin-top: 8px;
      font-size: 10vw;
    }

    .action-buttons {
      margin-top: 16px;
    }

    .my-tab-container {
      margin-top: 16px;
    }

    .my-tab-item {
      width: 120px;
    }

    .my-tab-name {
      font-size: 14px;
      text-align: center;
      margin-top: 2px;
    }

    .my-tab-icon {
      font-size: 24px;
    }

    .my-tab-item {
      border-bottom: 3px solid rgb(219, 219, 219);
    }

    .my-active-tab {
      border-bottom: 3px solid var(--logo-twig-color);
    }

    .feature-showcase-container {
      flex-direction: column;
      margin-top: 12px;
    }

    .video-container {
      width: 100%;
    }

    .explanatory-card {
      width: 100%;
    }

    .card-description {
      font-size: 12px;
    }

    .screenshot-caption {
      font-size: 12px;
    }
  }

  // greater than or equal to 768px;
  @media (min-width: 1280px) {
    .hero-title {
      margin-left: -6px;
      font-size: 80px;
    }

    .action-buttons {
      width: 30vw;
    }
  }
</style>
