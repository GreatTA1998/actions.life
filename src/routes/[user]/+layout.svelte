<script>
  import PopoverInputContext from '$lib/components/PopoverInputContext.svelte'
  import TaskPopup from '/src/routes/[user]/components/TaskPopup/TaskPopup.svelte'
  import ExtendRoutines from '/src/routes/[user]/components/ExtendRoutines.svelte'
  import { doc, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init'
  import { user, clickedTaskID } from '$lib/store'
  import { onMount, onDestroy, getContext } from 'svelte'
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
      if (!snap.exists()) User.create()
      else {
        user.set({ ...snap.data() })
      }
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