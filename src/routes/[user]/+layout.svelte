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

  let unsubscribe = () => {}
  let uid = $derived(page.params.user)

  onMount(listenToUser)

  onDestroy(unsubscribe)

  function listenToUser () {
    const ref = doc(db, '/users/' + uid)
    unsubscribe = onSnapshot(ref, async (snap) => {
      if (snap.exists()) {
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