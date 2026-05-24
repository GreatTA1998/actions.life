import { signInAnonymously, getAdditionalUserInfo } from 'firebase/auth'
import { get } from 'svelte/store'
import { firebaseAuth, user } from '$lib/store'
import User from '$lib/db/models/User.js'
import { initializeSeedData } from '$lib/db/seed.js'

/** Ensures a Firebase anonymous session exists (for demo or before linking Google). */
export async function ensureAnonymousSession () {
  const auth = get(firebaseAuth)
  if (auth.currentUser?.isAnonymous) {
    if (!get(user).uid) user.set({ uid: auth.currentUser.uid })
    return auth.currentUser
  }

  const result = await signInAnonymously(auth)
  if (getAdditionalUserInfo(result).isNewUser) {
    const mirrorDoc = await User.create(auth.currentUser)
    user.set(mirrorDoc)
    await initializeSeedData()
  } else if (!get(user).uid) {
    user.set({ uid: result.user.uid })
  }
  return result.user
}
