<script>
  import AppContext from './AppContext.svelte'
  import DragDropContext from '$lib/components/DragDropContext.svelte'
  import TheSnackbar from '/src/routes/[user]/components/TheSnackbar.svelte'
  import { user, authChecked, loggedIn, firebaseAuth } from '$lib/store'
  import { page } from '$app/state'
  import { goto } from '$app/navigation'
  import { onAuthStateChanged } from 'firebase/auth'
  import { onMount } from 'svelte'
  import { isMobile } from '$lib/utils/core.js'
  import { translateJSConstantsToCSSVariables } from '$lib/utils/constants.js'
  import { treesByDate } from '/src/routes/[user]/components/Calendar/service.js'
  import '@fontsource-variable/inter'
  import 'virtual:uno.css'
  import 'normalize.css/normalize.css'
  import '$lib/styles/view-transitions.css'
  import '$lib/styles/reset.css'
  import '$lib/styles/utility.css'

  let { children } = $props()

  onMount(() => {
    translateJSConstantsToCSSVariables()

    onAuthStateChanged($firebaseAuth, async (resultUser) => {
      authChecked.set(true) // from cookie, takes around 300 - 500ms
      
      if (page.url.pathname.startsWith('/legal')) return

      else if (!resultUser) {
        goto('/')
        loggedIn.set(false)
        user.set({})
      } 
      
      else {
        goto(`/${resultUser.uid}/${isMobile() ? 'mobile' : ''}`)
        loggedIn.set(true)
        // [user]/+layout.svelte will hydrate `user`
      }
    })
  })
</script>

<div>
  <div
    style="z-index: 99; background: var(--offwhite-bg); width: 100vw; height: 100vh"
    class="center"
    class:invisible={$authChecked && (!$loggedIn || $loggedIn && $user.uid && Object.keys($treesByDate).length > 0)}
  >
    <img
      src="/logo-no-bg.png"
      class="app-loading-logo elementToFadeInAndOut center"
      alt="logo"
      style="width: 48px; height: 48px;"
    />
  </div>

  <div>
    <AppContext>
      <DragDropContext>
        {@render children()}
        
        <TheSnackbar />
      </DragDropContext>
    </AppContext>
  </div>
</div>

<style>
  :global(:root) {
    --accent-color: rgb(92, 101, 22);
    --base-color: rgb(0, 89, 125);
    --sub-color: rgb(172, 160, 78);
    --success-color: #188038;

    --logo-twig-color: #b34f1b;
    --location-indicator-color: var(--logo-twig-color);
    --grip-line-color: rgba(0,0,0,0.175); /* 0.15 too faint for mf, 0.2 too prominent for me */
    --task-action-subtle-color: rgb(0,0,0,0.2); /*rgb(120, 120, 120); */
    --fine-control-color: rgb(120, 120, 120);
    --scheduled-info-color: rgb(0, 0, 0);
    --task-name-color: rgb(0, 0, 0);
    --left-padding: 6px; /* only applies to TaskElement, PhotoTaskElement, IconTaskElement */ 
    --width-within-column: 94%;

    --calendar-section-left-spacing: 2vw;
    --experimental-black: hsla(0, 100%, 0%, 0.6);
    --offwhite-bg: rgb(250, 250, 250);
    --faint-color: lightgrey;
    --popup-control: 1.67rem;
  }

  :global(.main-content) {
    padding: 1rem;
    overflow-y: auto;
    height: 100%;
  }

  /* shared by time pickers, duration pickers etc. overrides local colors (non-global classes takes precedence apparently no matter the ordering) */
  :global(.highlighted-option) {
    color: black !important;
    font-weight: 600 !important;
  }

  :global(.flexbox) {
    display: flex;
  }

  /* Original layout.svelte styles */
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

  :global(.ghost-negative) {
    position: absolute;
    bottom: calc(-1 * var(--heights-sub-dropzone))
  }

  :global(.benefits-explanation) {
    max-width: 520px;
    margin: 0 auto;
    padding: 0 0 0 0;
  }

  :global(.benefits-explanation p) {
    margin: 0;
    font-size: 16px;
    line-height: 1.6;
    color: #374151;
  }
</style>
