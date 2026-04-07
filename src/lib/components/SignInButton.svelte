<script>
  import { signInWithPopup, GoogleAuthProvider, browserPopupRedirectResolver } from 'firebase/auth'
  import { firebaseAuth } from '$lib/store'
  import GoogleIdentityButton from '$lib/components/GoogleIdentityButton.svelte'
  import { getContext } from 'svelte'
  import { getFirestoreDoc } from '$lib/db/helpers.js'

  const { User } = getContext('app')

  async function signInWithGoogle () {
    try {
      const result = await signInWithPopup(
        $firebaseAuth,
        new GoogleAuthProvider(),
        browserPopupRedirectResolver
      )

      try {
        const mirrorDoc = await getFirestoreDoc(`/users/${result.user.uid}`) 
        if (!mirrorDoc) {
          User.create()
        } 
      } catch (error) {
        console.log('error =', error)
        alert('get() failed: most likely because device is offline')
      }

      // const credential = GoogleAuthProvider.credentialFromResult(result);
      // const token = credential.accessToken;
      // IdP data available using getAdditionalUserInfo(result)
    } catch(error) {
      console.error("error =", error)

      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
    }
  }
</script>

<GoogleIdentityButton 
  onclick={signInWithGoogle}
  extraStyle="
    background: white; 
    box-shadow: 0 1px 2px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.05);
  "
/>

