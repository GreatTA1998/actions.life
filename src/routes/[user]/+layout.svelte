<script>
  import { doc, onSnapshot, setDoc } from 'firebase/firestore'
  import { db } from '$lib/db/init'
  import { user, userInfoFromAuthProvider } from '$lib/store'
  import { onMount, onDestroy } from 'svelte'
  import { page } from '$app/stores'
  import User from '$lib/db/models/User.js'

  let unsub

  $: userID = $page.params.user

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
        initializeNewFirestoreUser(ref, $userInfoFromAuthProvider)
      } else {
        user.set({ ...snap.data() })
      }
    })
  }

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
  <slot>

  </slot>
</div>