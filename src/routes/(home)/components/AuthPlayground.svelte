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
  import User from '$lib/db/models/User.js'

  async function onclick () {
    try {
      const result = await linkWithPopup(
        get(firebaseAuth).currentUser,
        new GoogleAuthProvider(),
        browserPopupRedirectResolver
      )
      return User.update({ email: result.user.email })
    } catch (e) {
      if (e.code === AuthErrorCodes.CREDENTIAL_ALREADY_IN_USE) {
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