<script>
  import GoogleLogo from '$lib/components/GoogleLogo.svelte'
  import MslArrowOutward from 'virtual:icons/material-symbols-light/arrow-outward'
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
    'relative flex flex-col gap-y-2 py-4 px-8 min-w-[240px] flex-1 rounded-[20px] border border-[#e5e5e5]',
    'shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
  ]}
>
  <MslArrowOutward class="pointer-events-none absolute right-8 top-4 size-5 text-neutral-500" />

  <div class="flex items-center gap-x-2 font-medium">
    <div class="size-5">
      <GoogleLogo />
    </div>
    
    <div>Sign in with Google</div>
  </div>

  <div class="text-sm text-neutral-600">
    <!-- Free for 1 year, no credit card required. -->
    Free forever for early beta users
  </div> 
</div>