<script>
  import '/src/app.css'
  import { user, loadingTasks } from '../store/index.js'
  import posthog from 'posthog-js'
  import { goto } from '$app/navigation'
  import { getAuth, onAuthStateChanged } from 'firebase/auth'
  import { onMount } from 'svelte'
  import { translateJSConstantsToCSSVariables } from '/src/utils/constants.js'
  import { userInfoFromAuthProvider } from '/src/store/index.js'

  let doingAuth = true

  onMount(() => {
    translateJSConstantsToCSSVariables()

    // fetching user takes around 300 - 500 ms
    onAuthStateChanged(getAuth(), async (resultUser) => {
      if (!resultUser) {
        user.set({})
        goto('/')

        // see how new visitors interacts with home page demos
        posthog.init('phc_Cm2c1eB0MCZLTjJDYHklZ7GUp0Ar7p5bIpF5hkCJPdo', {
          api_host: 'https://us.i.posthog.com',
          person_profiles: 'always' // or 'always' to create profiles for anonymous users as well
        })
      } else {
        goto(`/${resultUser.uid}/${isMobile() ? 'mobile' : ''}`)

        userInfoFromAuthProvider.set({
          email: resultUser.email,
          uid: resultUser.uid 
        })
      }
      doingAuth = false
    })
  })

  function isMobile () {
    return window.innerWidth <= 768 // You can adjust the width threshold as needed
  }
</script>

<!-- TO-DO: fix loader -->
<!-- !(doingAuth || $loadingTasks) -->
<div
  id="loading-screen-logo-start"
  style="z-index: 99999; background: white; width: 100vw; height: 100vh"
  class="center"
  class:invisible={!doingAuth}
>
  <img
    src="/trueoutput-square-nobg.png"
    class="app-loading-logo elementToFadeInAndOut center"
    alt="logo"
    style="width: 48px; height: 48px;"
  />
</div>

<div>
  <slot>

  </slot>
</div>

<style>
  .invisible {
    visibility: hidden;
  }
  /* From Prabhakar's centering solution that works for iOS unlike StackOverflow
  https://github.com/project-feynman/v3/blob/d864f54d9a69e6cdf0beb7818e8b07a85cebb7eb/src/components/SeeExplanation.vue */
  .center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .elementToFadeInAndOut {
    animation: fadeInOut 1.4s ease-out 99 forwards;
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  @media screen and (min-width: 320px) {
    .app-loading-logo {
      width: 110px;
      height: 110px;
      border-radius: 18px;
    }
  }
  @media screen and (min-width: 768px) {
    .app-loading-logo {
      width: 250px;
      height: 250px;
      border-radius: 40px;
    }
  }
</style>
