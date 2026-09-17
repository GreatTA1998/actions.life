<script>
  import { 
    linkWithCredential, 
    signInWithCredential, 
    GoogleAuthProvider,
    AuthErrorCodes
  } from 'firebase/auth'
  import { setupCalendarsOfAccount } from '$lib/features/google-calendar/gcal.js'
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'
  import User from '$lib/db/models/User.js'
  import GCalAccount from '$lib/db/models/GCalAccount.js'
  import { cloudFunction } from '$lib/utils/cloudFunctions.js'
  import { firebaseAuth, loggedIn, user, authUser, authChecked } from '$lib/store'
  import { page } from '$app/state'
  import { goto } from '$app/navigation'
  import {
    NATIVE_OAUTH_STATE_GCAL,
    appOAuthUrlFromSearch,
    shouldBounceOAuthToApp
  } from '$lib/native/googleOAuth.js'
  import { reportError } from '$lib/utils/errors.js'

  const EXCHANGE_TIMEOUT_MS = 20_000
  const AUTH_WAIT_MS = 8_000

  const initialBounce = shouldBounceOAuthToApp(page.url.searchParams.get('state'))
    ? appOAuthUrlFromSearch(page.url.search)
    : ''

  let message = $state(initialBounce ? 'Returning to the app…' : 'Welcome! Preparing your account...')
  let bounceHref = $state(initialBounce)
  let failed = $state(false)

  onMount(() => {
    let cancelled = false
    handleOAuthRedirect(() => cancelled)
    return () => { cancelled = true }
  })

  async function handleOAuthRedirect (isCancelled) {
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
      fail(params.get('error') === 'access_denied'
        ? 'Google sign-in was cancelled.'
        : 'Google sign-in did not return an authorization code.')
      return
    }

    try {
      const redirect_uri = params.get('oauth_redirect') || (page.url.origin + '/auth/callback')
      const response = await withTimeout(
        cloudFunction('exchangeForTokens', {
          authorizationCode,
          redirect_uri,
        }),
        EXCHANGE_TIMEOUT_MS,
        'Token exchange'
      )

      if (isCancelled()) return

      const payload = response?.data
      const tokens = payload?.tokens
      const email = payload?.email
      const id = payload?.id
      if (!tokens?.id_token) {
        fail('Google sign-in did not return tokens. Try again.')
        return
      }

      if (state === NATIVE_OAUTH_STATE_GCAL) {
        const current = await waitForAuthUser(AUTH_WAIT_MS)
        await GCalAccount.create(email, id, tokens)
        setupCalendarsOfAccount(tokens.refresh_token, id)
        goto(current?.uid && !current.isAnonymous ? '/' + current.uid : '/')
        return
      }

      const credential = GoogleAuthProvider.credential(tokens.id_token)
      const currentUser = await waitForAuthUser(AUTH_WAIT_MS)

      try {
        const result = await linkWithCredential(currentUser, credential)
        user.update(u => ({ ...u, uid: result.user.uid }))
        await Promise.all([
          User.update({ email: result.user.email }),
          GCalAccount.create(email, id, tokens)
        ]) 
        goto('/' + result.user.uid)
        loggedIn.set(true)
        setupCalendarsOfAccount(tokens.refresh_token, id)
      } catch (error) {
        if (error.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
          const result = await signInWithCredential(get(firebaseAuth), credential)
          goto('/' + result.user.uid)
          loggedIn.set(true)
        } else {
          throw error
        }
      }
    } catch (error) {
      if (isCancelled()) return
      reportError({
        subject: 'auth/callback failed',
        content: `${error?.code ?? ''}\n${error?.message ?? error}\n${error?.stack ?? ''}`
      })
      fail(describeError(error))
    }
  }

  function fail (text) {
    failed = true
    message = text
  }

  function describeError (error) {
    const code = error?.code ? ` (${error.code})` : ''
    return (error?.message || 'Google sign-in failed.') + code
  }

  function withTimeout (promise, ms, label) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(
        () => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s.`)),
        ms
      )
      promise.then(
        (value) => { clearTimeout(t); resolve(value) },
        (error) => { clearTimeout(t); reject(error) }
      )
    })
  }

  function waitForAuthUser (ms) {
    const existing = get(firebaseAuth)?.currentUser || get(authUser)
    if (existing) return Promise.resolve(existing)

    return new Promise((resolve, reject) => {
      let settled = false
      let unsubs = []

      const timer = setTimeout(() => {
        cleanup()
        reject(new Error('Timed out waiting for a signed-in session.'))
      }, ms)

      function maybe () {
        queueMicrotask(() => {
          if (settled) return
          const u = get(firebaseAuth)?.currentUser || get(authUser)
          if (u) {
            cleanup()
            resolve(u)
            return
          }
          if (get(authChecked)) {
            cleanup()
            reject(new Error('No signed-in session to link Google to.'))
          }
        })
      }

      function cleanup () {
        if (settled) return
        settled = true
        clearTimeout(timer)
        for (const unsub of unsubs) unsub()
      }

      unsubs = [authUser.subscribe(maybe), authChecked.subscribe(maybe)]
    })
  }
</script>

<div class="p-4">
  {message}
  {#if bounceHref}
    <p class="mt-2">
      <a href={bounceHref}>Open actions.life</a>
    </p>
  {/if}
  {#if failed}
    <p class="mt-2">
      <a href="/">Back to home</a>
    </p>
  {/if}
</div>
