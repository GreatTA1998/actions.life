<script>
  import TheSnackbar from '/src/routes/[user]/components/TheSnackbar.svelte'
  import TaskPopup from '/src/routes/[user]/components/TaskPopup/TaskPopup.svelte'
  import ExtendRoutines from '/src/routes/[user]/components/ExtendRoutines.svelte'
  import { doc, onSnapshot, setDoc } from 'firebase/firestore'
  import { db } from '$lib/db/init'
  import { user, userInfoFromAuthProvider, showSnackbar, isTaskPopupOpen } from '$lib/store'
  import { onMount, onDestroy, getContext } from 'svelte'
  import { page } from '$app/state'

  let { children } = $props()
  const { User } = getContext('app')

  let unsub = () => {}
  let uid = $derived(page.params.user)

  onMount(() => {
    console.time('listenToUser')
    listenToUser()
  })

  onDestroy(() => {
    if (unsub) unsub()
  })

  function listenToUser () {
    const ref = doc(db, '/users/' + uid)
    unsub = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) {
        initializeNewFirestoreUser(ref, $userInfoFromAuthProvider)
      } else {
        user.set({ ...snap.data() })
      }
      console.timeEnd('listenToUser')
    })
  }
  
  // TO-DO: move to User model e.g. User.create()
  async function initializeNewFirestoreUser (ref, authData) {
    const userObj = User.schema.parse({
      uid: authData.uid,
      email: authData.email
    })

    return await setDoc(ref,
      userObj,
      { merge: true }
    ).catch((err) => console.error('error in initializeNewFirestoreUser', err))
  }
</script>

<div>
  {@render children()}

  {#if $user.uid}
    <ExtendRoutines />
  {/if}

  {#if $isTaskPopupOpen}
    <TaskPopup />
  {/if}

  {#if $showSnackbar}
    <TheSnackbar>Email copied to clipboard successfully.</TheSnackbar>
  {/if}
</div>