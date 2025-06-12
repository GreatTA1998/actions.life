<script>
  import { hasFetchedUser } from '/src/lib/store'
  import { onMount } from 'svelte'
  import NavbarContentLayout from '$lib/components/NavbarContentLayout.svelte'
  import HeroSection from './components/HeroSection.svelte'
  import TabNavigation from './components/TabNavigation.svelte'
  import FeatureShowcase from './components/FeatureShowcase.svelte'

  let isSoundOff = true
  let isPlaying = false
  let hasMobilePlayButtonAlready = true

  onMount(() => {
    
  })

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

  function handleTabClick(index) {
    currentIdx = index
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
      style="background: rgb(250, 250, 250); border-bottom: 0px solid lightgrey; display: flex; align-items: center; height: 54px; padding-left: 2vw;"
    >
      <!-- svelte-ignore a11y-missing-attribute -->
      <img
        src="/logo-no-bg.png"
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
      style="display: flex; flex-grow: 1; height: 100%; padding: 2.5%; padding-top: 2%;"
      class="home-page-background"
    >
      <div style="width: 100%; min-width: 200px; height: 80vh; border-radius: 10px; margin-top: 100px;">
        <HeroSection />

        <!-- <TabNavigation 
          {currentIdx} 
          onTabClick={handleTabClick}
        /> -->

        <!-- <FeatureShowcase 
          currentFeature={fourAbilities[currentIdx]}
          bind:isPlaying
          bind:hasMobilePlayButtonAlready
          bind:isSoundOff
        /> -->
      </div>
    </div>
  </NavbarContentLayout>
{/if}

<style lang="scss">
  .home-page-background {
    background-color: rgb(250, 250, 250);
  }

  .transparent-glow-navbar {
    background-color: rgba(150, 150, 150, 0.1);
    border-bottom: none;
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
</style>
