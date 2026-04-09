<script>
  import UserAppInstance from '$lib/components/UserAppInstance.svelte'
  import User from '$lib/db/models/User.js'
  import { firebaseAuth } from '$lib/store'
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
      await User.create($firebaseAuth.currentUser) 
      
      await initializeSeedData()
    }
    console.log('assumption: mirror doc created, uid =', result.user.uid)
    uid = result.user.uid
  })
</script>

{#if uid}
  <UserAppInstance {uid} />
{/if}