<script>
  import GoogleIdentityButton from '$lib/components/GoogleIdentityButton.svelte'
  import {
    AuthErrorCodes,
    GoogleAuthProvider,
    linkWithPopup,
    signInWithCredential,
    browserPopupRedirectResolver,
  } from 'firebase/auth'
  import { firebaseAuth } from '$lib/store'
  import { get } from 'svelte/store'

  async function onclick () {
    try {
      await linkWithPopup(
        get(firebaseAuth).currentUser,
        new GoogleAuthProvider(),
        browserPopupRedirectResolver
      )
    } catch (e) {
      if (e.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
        console.log('credentials already in use')
        await signInWithCredential(
          get(firebaseAuth),
          GoogleAuthProvider.credentialFromError(e)
        )
      } 
      else throw e
    }
  }
</script>

<GoogleIdentityButton 
  {onclick}
  extraStyle="
    background: white; 
    box-shadow: 0 1px 2px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.05);
  "
/>