<script>
  import GoogleLogo from '$lib/components/GoogleLogo.svelte'
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

<div {onclick}
  class={[
    'flex flex-col gap-y-2 p-6 min-w-[240px] flex-1 rounded-[20px] border border-[#e5e5e5]',
    'shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
  ]}
>
  <div class="flex items-center gap-x-2 font-medium">
    <div class="size-6">
      <GoogleLogo />
    </div>
    
    <div>Log in with Google</div>
  </div>

  <div class="text-sm text-neutral-600">
    <!-- Free for 1 year, no credit card required. -->
    Free forever for early invite users
  </div> 
</div>