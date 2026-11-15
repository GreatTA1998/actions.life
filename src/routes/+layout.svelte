<script>
  import { reportError } from '$lib/utils/errors.js'
  import { goto } from '$app/navigation'
  import { loadSounds } from '$lib/features/audio.js'
  import { loading, user, authUser, authChecked, loggedIn, initialDataReady, activeView, firebaseAuth } from '$lib/store'
  import { page } from '$app/state'
  import { onAuthStateChanged } from 'firebase/auth'
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { translateJSConstantsToCSSVariables } from '$lib/utils/constants.js'
  import { fade } from 'svelte/transition'
  import LoadingLogo from '$lib/components/LoadingLogo.svelte'
  import { warmShellUrls } from '$lib/pwa/warmShell.js'
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
      // Keep the signed-in calendar route warm for offline reloads
      warmShellUrls(['/', `/${$user.uid}`, page.url.pathname])
    }
  })

  onMount(() => {    
    loadSounds()

    translateJSConstantsToCSSVariables()

    // Always warm the marketing shell; user routes warm after data is ready
    warmShellUrls(['/', page.url.pathname])

    // Safety net: never leave the logo spinner forever if auth/network stalls offline.
    // Cached Firestore + auth usually resolve much faster; this only clears a stuck overlay.
    const loadingWatchdog = setTimeout(() => {
      if (!get(loading)) return
      if (!navigator.onLine && (get(authChecked) || get(initialDataReady) || get(user)?.uid)) {
        loading.set(false)
      }
    }, 2500)

    const unsubAuth = onAuthStateChanged($firebaseAuth, onResult, onError)

    return () => {
      clearTimeout(loadingWatchdog)
      unsubAuth()
    }
  })

  async function onResult (resultUser) {
    authChecked.set(true) // from IndexedDB / cookie, typically ~50–500ms with persistence
    authUser.set($firebaseAuth.currentUser)

    if (page.url.pathname.startsWith('/auth/callback')) {
      loading.set(false)
      // let /auth/callback/+page.svelte handle redirecting
    }

    else if (page.url.pathname.startsWith('/auth')) {
      loading.set(false)
    }
  
    else if (!resultUser) {
      goto('/')
      loading.set(false)
      loggedIn.set(false)
      initialDataReady.set(false)
      user.set({})
      activeView.set('CALENDAR')
    } 

    else if (resultUser.isAnonymous) {
      goto('/', { noScroll: true }) // otherwise new visitor gets scroll reset to top when anonymousLogin resolves
      loading.set(false)
      loggedIn.set(true)
      warmShellUrls(['/'])
    }
    
    else if (resultUser.email) {
      goto('/' + $authUser.uid)
      loggedIn.set(true)
      warmShellUrls(['/', `/${$authUser.uid}`])
      // <UserAppInstance/> above will later set `initialDataReady = true`
    }
  }

  async function onError (error) {
    // Auth persistence can still succeed offline; only surface unexpected failures.
    authChecked.set(true)
    if (!navigator.onLine) {
      loading.set(false)
      return
    }
    reportError({
      subject: 'onAuthStateChanged () failed',
      content: `code: ${error.code ?? ''}\nmessage: ${error.message}\nstack: ${error.stack ?? ''}`
    })
  }
</script>

<div class="relative z-0">
  {@render children()}
</div>

{#if $loading}
  <div transition:fade class={['center', 'w-screen h-screen bg-[var(--offwhite-bg)]']}>

  </div>
{/if}

{#if $loading} <!-- must be separate from the transition block -->
  <LoadingLogo />
{/if}

<style>
  .center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
