<script>
  import UserAppInstance from '$lib/components/UserAppInstance.svelte'
  import User from '$lib/db/models/User.js'
  import { firebaseAuth, user } from '$lib/store'
  import { 
    getAuth, 
    signInAnonymously,
    getAdditionalUserInfo,
  } from 'firebase/auth'
  import { onMount } from 'svelte'
  import { initializeSeedData } from '$lib/db/seed.js'

  let uid = ''

  onMount(async () => {
    const result = await signInAnonymously(getAuth())

    if (getAdditionalUserInfo(result).isNewUser) {
      const result = await User.create($firebaseAuth.currentUser) 
      user.set(result) // needed to read $user.maxOrderValue for seed data
      await initializeSeedData()
    }
    uid = result.user.uid
  })
</script>

{#if uid}
  <UserAppInstance {uid} />
{/if}