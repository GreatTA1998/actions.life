<script>
  import User from '$lib/db/models/User.js'
  import { firebaseAuth, user } from '$lib/store'
  import { 
    signInAnonymously,
    getAdditionalUserInfo,
  } from 'firebase/auth'
  import { onMount } from 'svelte'
  import { initializeSeedData } from '$lib/db/seed.js'

  let { children } = $props()

  let uid = $state('')

  onMount(async () => {
    const result = await signInAnonymously($firebaseAuth)

    if (getAdditionalUserInfo(result).isNewUser) {
      const mirrorDoc = await User.create($firebaseAuth.currentUser) 
      user.set(mirrorDoc) // needed to read $user.maxOrderValue for seed data
      await initializeSeedData()
    }
    uid = result.user.uid
  })
</script>

{@render children(uid)}