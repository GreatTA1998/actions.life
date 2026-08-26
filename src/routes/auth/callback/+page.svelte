<script>
  import { 
    linkWithCredential, 
    signInWithCredential, 
    GoogleAuthProvider,
    AuthErrorCodes,
    onAuthStateChanged
  } from 'firebase/auth'
  import { setupCalendarsOfAccount } from '$lib/features/google-calendar/gcal.js'
  import { onMount } from 'svelte'
  import User from '$lib/db/models/User.js'
  import GCalAccount from '$lib/db/models/GCalAccount.js'
  import { cloudFunction } from '$lib/utils/cloudFunctions.js'
  import { firebaseAuth, loggedIn, user } from '$lib/store'
  import { page } from '$app/state'
  import { goto } from '$app/navigation'
  import { get } from 'svelte/store'

  onMount(handleOAuthRedirect)

  function waitForCurrentUser () {
    const existing = get(firebaseAuth).currentUser
    if (existing) return Promise.resolve(existing)
    return new Promise((resolve, reject) => {
      let unsub = () => {}
      const timeout = setTimeout(() => {
        unsub()
        reject(new Error('Timed out waiting for Firebase Auth to restore the session'))
      }, 10000)
      unsub = onAuthStateChanged(get(firebaseAuth), (u) => {
        if (!u) return
        clearTimeout(timeout)
        unsub()
        resolve(u)
      })
    })
  }

  async function handleOAuthRedirect () {
    // Kick off token exchange immediately; overlap with auth restore from IndexedDB.
    const tokenPromise = cloudFunction('exchangeForTokens', {
      authorizationCode: page.url.searchParams.get('code'),
      redirect_uri: page.url.origin + '/auth/callback',
    })

    const [tokenResult, currentUser] = await Promise.all([
      tokenPromise,
      waitForCurrentUser()
    ])

    const { data: { tokens, email, id } } = tokenResult
    const credential = GoogleAuthProvider.credential(tokens.id_token)

    try {
      const result = await linkWithCredential(currentUser, credential) // anonymous → Google
      user.update(u => ({ ...u, uid: result.user.uid })) // GCalAccount implicitly depends on get(user)
      await User.update({ email: result.user.email })
      loggedIn.set(true)
      goto('/' + result.user.uid)
      // Calendar account writes are not needed to land in the app
      GCalAccount.create(email, id, tokens)
        .then(() => setupCalendarsOfAccount(tokens.refresh_token, id))
        .catch(console.error)
    } catch (error) { // returning user
      if (error.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
        const result = await signInWithCredential(get(firebaseAuth), credential)
        loggedIn.set(true)
        goto('/' + result.user.uid)
      } 
      else throw error
    }
  }
</script>

<div class="p-4">
  Welcome! Preparing your account...
</div>
