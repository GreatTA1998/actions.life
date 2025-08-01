import { z } from 'zod'
import { db } from '$lib/db/init.js'
import {
  doc,
  updateDoc,
  arrayUnion,
  collection,
  addDoc
} from "firebase/firestore"

const User = {
  schema: z.object({
    email: z.string(),
    isSubscriber: z.boolean().default(false),
    maxOrderValue: z.number().default(3),
    uid: z.string(),

    // missing properties from August 1
    calendarTheme: z.string().default('offWhite'),
    hasGridlines: z.boolean().default(true)

    // to deprecate
    // FCMTokens: z.array(z.string()).default([]),
    // phoneNumber: z.string().optional(),
  }),

  update (userUID, keyValueChanges) {
    return updateDoc(doc(db, "users", userUID), keyValueChanges)
      .catch((err) => console.error("error in User.update", err))
  },

  addIconURL (userUID, name, url, hidden) {
    return addDoc(collection(db, "users", userUID, "icons"), {
      url,
      name,
      hidden
    })
      .then(() => url)
      .catch((err) => console.error("error in User.addIcon", err))
  },

  addFCMToken (userUID, FCMToken) {
    return updateDoc(doc(db, "users", userUID), {
      FCMTokens: arrayUnion(FCMToken)
    })
      .catch((err) => console.error("error in User.update", err))
  }
}

export default User 