<script>
  import MainPage from '$lib/MainPage/MainPage.svelte'
  import { handleInitialTasks } from '$lib/MainPage/handleTasks'
  import { doc, onSnapshot, setDoc } from 'firebase/firestore'
  import { db } from '/src/back-end/firestoreConnection'
  import { user, userInfoFromAuthProvider } from '/src/store'
  import { page } from '$app/stores'
  import { onMount, onDestroy } from 'svelte'

  $: userID = $page.params.user
  $: authData = $page.state // { email, uid } from a newly signed-in user

  let unsubUserListener = null

  // fetch everything needed in parallel
  onMount(() => {
    listenToUserDoc(userID)
    handleInitialTasks(userID)
  })

  onDestroy(() => {
    if (unsubUserListener) unsubUserListener()
  })

  function listenToUserDoc (userID) {
    const ref = doc(db, '/users/' + userID)
    unsubUserListener = onSnapshot(ref, async (snap) => {
      if (!snap.exists()) {
        console.log('user does not exist, creating a new mirror doc')
        initializeNewFirestoreUser(ref, $userInfoFromAuthProvider)
      } else {
        user.set({ ...snap.data() })
      }
    })
  }

  async function initializeNewFirestoreUser (ref, authData) {
    return await setDoc(ref,
      {
        uid: authData.uid,
        email: authData.email || ''
      },
      { merge: true }
    ).catch((err) => console.error('error in initializeNewFirestoreUser', err))
  }
</script>

<!-- i.e. the user is fully hydrated, with properties like `journal` already initialized -->
{#if $user.uid}
  <MainPage />
{/if}
