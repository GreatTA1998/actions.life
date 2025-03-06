<div class="sign-in-button"
  on:click={signInWithGoogle}
>
  Sign in
  <span class="material-symbols-outlined" style="font-size: 24px; margin-left: 4px;">
    arrow_right_alt
  </span>
</div>

<script>
  import { getAuth, signInWithRedirect, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
  import { userInfoFromAuthProvider } from '/src/store/index.js'

  async function signInWithGoogle () {
    const auth = getAuth();
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      // standardization
      userInfoFromAuthProvider.set({
        email: user.email,
        uid: user.uid,
        name: user.displayName || ''
      })

      // IdP data available using getAdditionalUserInfo(result)
      // ...
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

<style>
  .sign-in-button {
    background: var(--logo-twig-color);
    font-weight: 600;
    color: white;
    margin-bottom: 2px;
    width: 208px;
    padding-left: 8px;
    padding-top: 6px;
    padding-bottom: 6px;
    border-radius: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    height: 40px;
  }
</style>