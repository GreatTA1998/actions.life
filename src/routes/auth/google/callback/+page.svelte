<script>
  import { onMount } from 'svelte'
  import { 
    linkWithCredential, 
    signInWithCredential, 
    GoogleAuthProvider,
    AuthErrorCodes
  } from 'firebase/auth'
  import User from '$lib/db/models/User.js'
  import { cloudFunction } from '$lib/utils/cloudFunctions.js'
  import { firebaseAuth } from '$lib/store'
  import { get } from 'svelte/store'
  import { page } from '$app/state'
  import { goto } from '$app/navigation'

  onMount(async () => {
    const code = page.url.searchParams.get('code')
    const { data } = await cloudFunction('signInCallback', {
      code,
      redirect_uri: window.location.origin + '/auth/google/callback',
    })

    const credential = GoogleAuthProvider.credential(data.idToken, data.accessToken)

    try {
      const result = await linkWithCredential(get(firebaseAuth).currentUser, credential)
      console.log("result =", result)
      await User.update({ email: result.user.email })
      goto(`/${result.user.uid}`) // `onAuthStateChanged` doesn't trigger with account linking
    } catch (error) {
      if (error.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
        await signInWithCredential(
          get(firebaseAuth), credential
        )
      } 
      else throw error
    }
  })
</script>