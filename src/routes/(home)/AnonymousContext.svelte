<script>
  import UserAppInstance from '$lib/components/UserAppInstance.svelte'
  import User from '$lib/db/models/User.js'
  import { firebaseAuth, user } from '$lib/store'
  import { 
    signInAnonymously,
    getAdditionalUserInfo,
  } from 'firebase/auth'
  import { onMount } from 'svelte'
  import { initializeSeedData } from '$lib/db/seed.js'

  let uid = $state('')

  onMount(async () => {
    const result = await signInAnonymously($firebaseAuth)

    if (getAdditionalUserInfo(result).isNewUser) {
      console.log('isNewUser, creating new account...')
      const result = await User.create($firebaseAuth.currentUser) 
      user.set(result) // needed to read $user.maxOrderValue for seed data
      await initializeSeedData()
    }
    uid = result.user.uid
    console.log('after AnonymousContext mount, uid =', uid)
  })
</script>

{#if uid}
  <UserAppInstance {uid} />
{/if}