<script>
  import AppContext from './AppContext.svelte'
  import DragDropContext from '$lib/components/DragDropContext.svelte'
  import TheSnackbar from '/src/routes/[user]/components/TheSnackbar.svelte'
  import { loadSounds } from '$lib/features/audio.js'
  import { user, authChecked, loggedIn, firebaseAuth } from '$lib/store'
  import { page } from '$app/state'
  import { goto } from '$app/navigation'
  import { onAuthStateChanged } from 'firebase/auth'
  import { onMount } from 'svelte'
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

  let loading = $state(true)

  $effect(() => {
    if ($authChecked && $loggedIn && $user.email && Object.keys($treesByDate).length > 0) {
      loading = false
    }
  })

  onMount(() => {
    loadSounds()

    translateJSConstantsToCSSVariables()

    onAuthStateChanged($firebaseAuth, async (resultUser) => {
      authChecked.set(true) // from cookie, takes around 300 - 500ms
      
      if (page.url.pathname.startsWith('/legal')) return
    
      if (!resultUser) {
        loading = false
        goto('/')
        loggedIn.set(false)
        user.set({})
      } 

      else if (resultUser.isAnonymous) {
        loading = false
        loggedIn.set(true)
      }
      
      else {
        goto('/' + resultUser.uid)
        loggedIn.set(true)
        // the `$effect` above will later set `loading = false`
        // [user]/+layout.svelte will hydrate `user`
      }
    })
  })
</script>

<div>
  <AppContext>
    <DragDropContext>
      {@render children()}
      
      <TheSnackbar />
    </DragDropContext>
  </AppContext>

  {#if loading}
    <div transition:fade 
      class={['center', 'w-screen h-screen bg-[var(--offwhite-bg)]']}>
    </div>
  {/if}

  {#if loading} <!-- must be separate from the transition block -->
    <img src="/logo-no-bg.png" 
      class={['pulse center', 'w-12 h-12 rounded-2xl']}
    />
  {/if}
</div>

<style>
  .center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .pulse {
    animation: opacityValues 0.5s ease-in-out infinite alternate;
  }

  @keyframes opacityValues {
    from { opacity: 0.1; }
    to   { opacity: 0.9; }
  }
</style>