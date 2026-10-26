<script>
  import User from '$lib/db/models/User.js'
  import { breakpoints, calendarDensity } from '$lib/utils/constants.js'
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
        ...defaultFontAndDensity(window.innerWidth)
      })
      user.set(mirrorDoc) // needed to read $user.maxOrderValue for seed data
      await initializeSeedData()
      await linkDemoGoogleCalendarAccount(result.user.uid)
    }
    uid = result.user.uid
  })

  // Slider stops in FontScaleSettings.svelte: [0.75, 0.875, 1, 1.125, 1.25]
  function defaultFontAndDensity (width) {
    if (width < breakpoints.tablet) {
      return { fontScale: 0.75, ...calendarDensity.mini }
    }
    if (width < breakpoints.desktop) {
      return { fontScale: 0.875, ...calendarDensity.dense }
    }
    return { fontScale: 1, ...calendarDensity.wide }
  }
</script>

{@render children(uid)}