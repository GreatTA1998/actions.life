<script>
  import User from '$lib/db/models/User.js'
  import { calendarDensity } from '$lib/utils/constants.js'
  import { firebaseAuth, user } from '$lib/store'
  import { 
    signInAnonymously,
    getAdditionalUserInfo,
  } from 'firebase/auth'
  import { onMount } from 'svelte'
  import { initializeSeedData } from '$lib/db/seed.js'
  import { isMobile } from '$lib/utils/core.js'

  let { children, onSeedDataReady } = $props()

  let uid = $state('')

  onMount(async () => {
    const result = await signInAnonymously($firebaseAuth)

    if (getAdditionalUserInfo(result).isNewUser) {
      const mirrorDoc = await User.create({
        ...$firebaseAuth.currentUser,
        ...(isMobile()
          ? { fontScale: 0.75, ...calendarDensity.dense }
          : calendarDensity.wide)
      })
      user.set(mirrorDoc) // needed to read $user.maxOrderValue for seed data
      const seedTasks = await initializeSeedData()
      // Immediately hydrate UI with seed data
      if (onSeedDataReady) {
        onSeedDataReady(seedTasks)
      }
    }
    uid = result.user.uid
  })
</script>

{@render children(uid)}