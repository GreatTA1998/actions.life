<script>
  import User from '$lib/db/models/User.js'
  import { newUserViewportDefaults } from '$lib/utils/constants.js'
  import { firebaseAuth, user } from '$lib/store'
  import { 
    signInAnonymously,
    getAdditionalUserInfo,
  } from 'firebase/auth'
  import { onMount } from 'svelte'
  import { initializeSeedData } from '$lib/db/seed.js'
  import { linkDemoGoogleCalendarAccount } from '$lib/db/demoGoogleAccount.js'

  let { children } = $props()

  let uid = $state('')

  onMount(async () => {
    const result = await signInAnonymously($firebaseAuth)

    if (getAdditionalUserInfo(result).isNewUser) {
      const mirrorDoc = await User.create({
        ...$firebaseAuth.currentUser,
        ...newUserViewportDefaults(window.innerWidth)
      })
      user.set(mirrorDoc) // needed to read $user.maxOrderValue for seed data
      await initializeSeedData()
      await linkDemoGoogleCalendarAccount(result.user.uid)
    }
    uid = result.user.uid
  })
</script>

{@render children(uid)}