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

  onMount(handleOAuthRedirect)

  async function handleOAuthRedirect () {
    const { data: { tokens, email, id } } = await cloudFunction('exchangeForTokens', {
      authorizationCode: page.url.searchParams.get('code'),
      redirect_uri: page.url.origin + '/auth/callback',
    })

    const credential = GoogleAuthProvider.credential(tokens.id_token)

    try { // first-time user
      const result = await linkWithCredential($firebaseAuth.currentUser, credential)
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

<div>

</div>