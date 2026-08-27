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

  let { children } = $props()

  let uid = $state('')
  let seedTasks = $state(null)

  onMount(async () => {
    const result = await signInAnonymously($firebaseAuth)
    uid = result.user.uid // Set uid first so UserAppInstance mounts

    if (getAdditionalUserInfo(result).isNewUser) {
      const mirrorDoc = await User.create({
        ...$firebaseAuth.currentUser,
        ...(isMobile()
          ? { fontScale: 0.75, ...calendarDensity.dense }
          : calendarDensity.wide)
      })
      user.set(mirrorDoc) // needed to read $user.maxOrderValue for seed data
      seedTasks = await initializeSeedData() // Set seed data after uid
    }
  })
</script>

{@render children(uid, seedTasks)}