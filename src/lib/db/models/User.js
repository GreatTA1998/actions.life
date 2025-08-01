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
    uid: z.string(),
    email: z.string(),
    maxOrderValue: z.number().default(3),

    // missing properties from August 1
    calendarTheme: z.string().default('offWhite'),
    hasGridlines: z.boolean().default(true),

    defaultPhotoLayout: z.string().default('side-by-side'),
    calEarliestHHMM: z.string().default('06:00'),
    calLastHHMM: z.string().default('00:00'),
    calSnapInterval: z.number().default(5),
    listAreaWidthRatio: z.number().default(0.0022295577727585616), // empirically determined from my account

    // unused
    // isSubscriber: z.boolean().default(false),
    // includeRoutinesInEvents: z.boolean().default(false),

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