<script>
  import { goto } from '$app/navigation'
  import { loadSounds } from '$lib/features/audio.js'
  import { user, authUser, authChecked, loggedIn, initialDataReady, firebaseAuth, loading } from '$lib/store'
  import { page } from '$app/state'
  import { onAuthStateChanged } from 'firebase/auth'
  import { onMount } from 'svelte'
  import { translateJSConstantsToCSSVariables } from '$lib/utils/constants.js'
  import { fade } from 'svelte/transition'
  import '@fontsource-variable/inter'
  import 'virtual:uno.css'
  import 'normalize.css/normalize.css'
  import '$lib/styles/variables.css'
  import '$lib/styles/view-transitions.css'
  import '$lib/styles/reset.css'
  import '$lib/styles/utility.css'

  let { children } = $props()

  $effect(() => {
    if ($authChecked && $loggedIn && $user.email && $initialDataReady) {
      loading.set(false)
    }
  })

  onMount(() => {    
    loadSounds()

    translateJSConstantsToCSSVariables()

    onAuthStateChanged($firebaseAuth, onResult, onError)
  })

  function onResult (resultUser) {
    authChecked.set(true) // from cookie, takes around 300 - 500ms
    authUser.set($firebaseAuth.currentUser)

    if (page.url.pathname.startsWith('/legal')) {
      loading.set(false)
    }
  
    else if (!resultUser) {
      goto('/')
      loading.set(false)
      loggedIn.set(false)
      user.set({})
    } 

    else if (resultUser.isAnonymous) {
      goto('/')
      loading.set(false)
      loggedIn.set(true)
    }
    
    else if (resultUser.email) {
      goto('/' + $authUser.uid)
      loggedIn.set(true)
      // <UserAppInstance/> above will later set `initialDataReady = true`
    }
  }

  async function onError (error) {
    reportError({
      subject: 'onAuthStateChanged () failed',
      content: `code: ${error.code ?? ''}\nmessage: ${error.message}\nstack: ${error.stack ?? ''}`
    })
  }
</script>

{@render children()}

{#if $loading}
  <div transition:fade 
    class={['center', 'w-screen h-screen bg-[var(--offwhite-bg)]']}>
  </div>
{/if}

{#if $loading} <!-- must be separate from the transition block -->
  <img src="/logo-no-bg.png" 
    class={['pulse center', 'w-12 h-12 rounded-2xl']}
  />
{/if}

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