<script>
  import PopoverInputContext from '$lib/components/PopoverInputContext.svelte'
  import TaskPopup from '/src/routes/[user]/components/TaskPopup/TaskPopup.svelte'
  import ExtendRoutines from '/src/routes/[user]/components/ExtendRoutines.svelte'
  import { doc, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init'
  import { user, clickedTaskID, firebaseAuth } from '$lib/store'
  import { onMount, onDestroy, getContext } from 'svelte'
  import { get } from 'svelte/store'
  import { page } from '$app/state'

  let { children } = $props()
  const { User } = getContext('app')

  let unsub = () => {}
  let uid = $derived(page.params.user)

  onMount(listenToUser)

  onDestroy(unsub)

  function listenToUser () {
    const ref = doc(db, '/users/' + uid)
    unsub = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) {
        const authUID = get(firebaseAuth).currentUser?.uid
        // Avoid creating docs off stale cache snapshots or wrong route params.
        if (authUID === uid && !snap.metadata.fromCache) await User.create()
        return
      } 

      user.set({ ...snap.data() })
    }, (error) => {
      console.error('Error listening to user doc:', error)
    })
  }
</script>

<div>
  {#if $user.uid}
    <ExtendRoutines />

    <PopoverInputContext>
      {@render children()}
      
      {#if $clickedTaskID}
        <TaskPopup />
      {/if}
    </PopoverInputContext>
  {/if}
</div>