<script>
  import { hasFetchedUser } from '/src/lib/store'
  import { onMount } from 'svelte'
  import NavbarContentLayout from '$lib/components/NavbarContentLayout.svelte'
  import HeroSection from './components/HeroSection.svelte'
  import TimelineDemo from './components/TimelineDemo.svelte'
  import HabitDemo from './components/HabitDemo.svelte'
  import JournalDemo from './components/JournalDemo.svelte'
  import AppDetailsSection from './components/AppDetailsSection.svelte'
  import UpdateLogSection from './components/UpdateLogSection.svelte'
  import TabNavigation from './components/TabNavigation.svelte'
  import FeatureShowcase from './components/FeatureShowcase.svelte'
  import VisionSection from './components/VisionSection.svelte'

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
          class="github-link"
          title="View on GitHub"
        >
          <!-- <svg width="20" height="20" viewBox="0 0 98 96" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="#24292f"/>
          </svg> -->
        </a>
      </div>
    </div>

    <div
      slot="content"
      style="display: flex; flex-grow: 1; height: 100%; padding: 2.5%; padding-top: 2%;"
      class="home-page-background"
    >
      <div style="width: 100%; min-width: 200px; border-radius: 10px; margin-top: 100px; display: flex; flex-direction: column; gap: 120px;">
        <HeroSection />

        <TimelineDemo />

        <HabitDemo />

        <JournalDemo />

        <VisionSection />

        <AppDetailsSection />

        <UpdateLogSection />

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

  .github-link {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 6px;
    transition: all 0.2s ease;
    background: transparent;
    border: none;
    text-decoration: none;
  }

  .github-link:hover {
    background: rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }

  .github-link svg {
    opacity: 0.7;
    transition: opacity 0.2s ease;
  }

  .github-link:hover svg {
    opacity: 1;
  }
</style>
