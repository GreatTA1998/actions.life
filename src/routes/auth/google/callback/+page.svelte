<script>
  import { onMount } from 'svelte'
  import { 
    linkWithCredential, 
    signInWithCredential, 
    GoogleAuthProvider,
    AuthErrorCodes
  } from 'firebase/auth'
  import User from '$lib/db/models/User.js'
  import GCalAccount from '$lib/db/models/GCalAccount.js'
  import { cloudFunction } from '$lib/utils/cloudFunctions.js'
  import { firebaseAuth } from '$lib/store'
  import { get } from 'svelte/store'
  import { page } from '$app/state'
  import { goto } from '$app/navigation'

  onMount(async () => {
    const authorizationCode = page.url.searchParams.get('code')
    const { data: { tokens, email, id } } = await cloudFunction('signInCallback', {
      authorizationCode,
      redirect_uri: window.location.origin + '/auth/google/callback',
    })
    const credential = GoogleAuthProvider.credential(tokens.id_token)

    try { // first-time user
      const result = await linkWithCredential(get(firebaseAuth).currentUser, credential)
      await Promise.all([
        User.update({ email: result.user.email }),
        GCalAccount.create(email, id, tokens)
      ]) 
      goto(`/${result.user.uid}`) // `onAuthStateChanged` doesn't trigger with account linking
    } catch (error) { // returning user
      if (error.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
        signInWithCredential(
          get(firebaseAuth), credential
        )
      } 
      else throw error
    }
  })
</script>