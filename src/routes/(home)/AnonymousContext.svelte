<script>
  import UserAppInstance from '$lib/components/UserAppInstance.svelte'
  import { getAuth, signInAnonymously } from 'firebase/auth'
  import { onMount, getContext } from 'svelte'

  const { User } = getContext('app')

  let uid = ''

  onMount(async () => {
    console.log("signing in")
    const result = await signInAnonymously(getAuth())
    console.log('result =', result)
    await User.create() // it secretly uses auth.currentUser
    console.log('assumption: mirror doc created, uid =', result.user.uid)
    uid = result.user.uid
  })
</script>

{#if uid}
  <UserAppInstance {uid} />
{/if}