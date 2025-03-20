<script>
  import { doc, onSnapshot, setDoc } from 'firebase/firestore'
  import { db } from '/src/db/init'
  import { user, userInfoFromAuthProvider } from '/src/store'
  import { onMount, onDestroy } from 'svelte'
  import { page } from '$app/stores'

  let unsub

  $: userID = $page.params.user

  // fetch everything needed in parallel
  onMount(() => {
    listenToUserDoc(userID)
  })

  onDestroy(() => {
    if (unsub) unsub()
  })

  function listenToUserDoc (userID) {
    const ref = doc(db, '/users/' + userID)
    unsub = onSnapshot(ref, async (snap) => {
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

<div>
  <slot>

  </slot>
</div>
