<script>
  import { 
    linkWithCredential, 
    signInWithCredential, 
    GoogleAuthProvider,
    AuthErrorCodes
  } from 'firebase/auth'
  import { setupCalendarsOfAccount } from '$lib/features/google-calendar/gcal.js'
  import { onMount } from 'svelte'
  import User from '$lib/db/models/User.js'
  import GCalAccount from '$lib/db/models/GCalAccount.js'
  import { cloudFunction } from '$lib/utils/cloudFunctions.js'
  import { firebaseAuth, loggedIn, user } from '$lib/store'
  import { page } from '$app/state'
  import { goto } from '$app/navigation'
  import {
    NATIVE_OAUTH_STATE_GCAL,
    appOAuthUrlFromSearch,
    shouldBounceOAuthToApp
  } from '$lib/native/googleOAuth.js'

  const initialBounce = shouldBounceOAuthToApp(page.url.searchParams.get('state'))
    ? appOAuthUrlFromSearch(page.url.search)
    : ''

  let message = $state(initialBounce ? 'Returning to the app…' : 'Welcome! Preparing your account...')
  let bounceHref = $state(initialBounce)

  onMount(handleOAuthRedirect)

  async function handleOAuthRedirect () {
    const params = page.url.searchParams
    const state = params.get('state')

    if (shouldBounceOAuthToApp(state)) {
      bounceHref = appOAuthUrlFromSearch(page.url.search)
      message = 'Returning to the app…'
      window.location.replace(bounceHref)
      return
    }

    const authorizationCode = params.get('code')
    if (!authorizationCode) {
      message = params.get('error') === 'access_denied'
        ? 'Google sign-in was cancelled.'
        : 'Google sign-in did not return an authorization code.'
      return
    }

    const redirect_uri = params.get('oauth_redirect') || (page.url.origin + '/auth/callback')
    const { data: { tokens, email, id } } = await cloudFunction('exchangeForTokens', {
      authorizationCode,
      redirect_uri,
    })

    if (state === NATIVE_OAUTH_STATE_GCAL) {
      await GCalAccount.create(email, id, tokens)
      setupCalendarsOfAccount(tokens.refresh_token, id)
      const current = $firebaseAuth.currentUser
      goto(current?.uid && !current.isAnonymous ? '/' + current.uid : '/')
      return
    }

    const credential = GoogleAuthProvider.credential(tokens.id_token)

    try {
      const result = await linkWithCredential($firebaseAuth.currentUser, credential) // `.currentUser` is the anonymous account
      user.update(u => ({ ...u, uid: result.user.uid })) // GCalAccount implicitly depends on get(user)
      await Promise.all([
        User.update({ email: result.user.email }),
        GCalAccount.create(email, id, tokens)
      ]) 
      goto('/' + result.user.uid)
      loggedIn.set(true)
      setupCalendarsOfAccount(tokens.refresh_token, id)
    } catch (error) { // returning user
      if (error.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
        const result = await signInWithCredential($firebaseAuth, credential)
        goto('/' + result.user.uid)
        loggedIn.set(true)
      } 
      else throw error
    }
  }
</script>

<div class="p-4">
  {message}
  {#if bounceHref}
    <p class="mt-2">
      <a href={bounceHref}>Open actions.life</a>
    </p>
  {/if}
</div>
