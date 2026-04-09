<script>
  import UserAppInstance from '$lib/components/UserAppInstance.svelte'
  import User from '$lib/db/models/User.js'
  import { getAuth, signInAnonymously } from 'firebase/auth'
  import { onMount } from 'svelte'

  let uid = ''

  onMount(async () => {
    const result = await signInAnonymously(getAuth())
    console.log('result =', result)

    // TO-DO: don't call .create() when it's a returning anonymous user
    await User.create() // it secretly uses auth.currentUser
    console.log('assumption: mirror doc created, uid =', result.user.uid)
    uid = result.user.uid
  })
</script>

{#if uid}
  <UserAppInstance {uid} />
{/if}