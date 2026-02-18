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
  import { fade } from 'svelte/transition'
  import '@fontsource-variable/inter'
  import 'virtual:uno.css'
  import 'normalize.css/normalize.css'
  import '$lib/styles/variables.css'
  import '$lib/styles/view-transitions.css'
  import '$lib/styles/reset.css'
  import '$lib/styles/utility.css'

  let { children } = $props()

  let dataReady = $derived($authChecked && (!$loggedIn || $loggedIn && $user.uid && Object.keys($treesByDate).length > 0))

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
  {#if !dataReady}
    <div transition:fade class="w-screen h-screen center z-[99] bg-[var(--offwhite-bg)]">
      <img src="/logo-no-bg.png" 
        class="pulse center w-12 h-12 rounded-2xl"
      />
    </div>
  {/if}

  <AppContext>
    <DragDropContext>
      {@render children()}
      
      <TheSnackbar />
    </DragDropContext>
  </AppContext>
</div>

<style>
  /* From Prabhakar's centering solution that works for iOS unlike StackOverflow
  https://github.com/project-feynman/v3/blob/d864f54d9a69e6cdf0beb7818e8b07a85cebb7eb/src/components/SeeExplanation.vue */
  .center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .pulse {
    animation: fadeInOut 1.6s ease-out 13 forwards;
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0.1;
    }
    50% {
      opacity: 0.5;
    }
    100% {
      opacity: 0.1;
    }
  }
</style>
