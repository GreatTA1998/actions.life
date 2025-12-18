import { z } from 'zod'
import { setFirestoreDoc, updateFirestoreDoc } from '$lib/db/helpers.js'
import { user } from '$lib/store/index.js'
import { get } from 'svelte/store'
import { getAuth } from 'firebase/auth'

const User = {
  schema: z.object({
    uid: z.string(),
    email: z.string(),
    maxOrderValue: z.number().default(10),

    // properties introduced from August 1 2024, maybe
    calendarTheme: z.string().default('offWhite'),

    defaultPhotoLayout: z.string().default('side-by-side'),
    calSnapInterval: z.number().default(1),
    listAreaWidthRatio: z.number().default(0.00223), // empirically determined from my account
    listAreaHeightRatio: z.number().default(0.004), // for mobile top-below view, default to 40% of viewport height

    // automation settings
    photoUploadAutoArchive: z.boolean().default(false),
    photoCompressWhenAttachingToTask: z.boolean().default(false), // NOTE: despite the name, this setting applies to ALL photo uploads (task attachments + MultiPhotoUploader)

    hideRoutines: z.boolean().default(true), // for mobile's future view
    lastRanRoutines: z.string().default(''), // for autoExtend.js

    // needed temporarily for backwards compatibility
    hasGridlines: z.boolean().default(true),
    calEarliestHHMM: z.string().default('00:00'),
    calLastHHMM: z.string().default('23:59'),

    selectedGoogleCalendarIds: z.array(z.string()).optional()
  }),

  async create () {
    const validatedUser = User.schema.parse(getAuth().currentUser)
    console.log('validatedUser =', validatedUser)
    return await setFirestoreDoc(`/users/${validatedUser.uid}`, 
      validatedUser
    )
  },

  async update (keyValueChanges) {
    const { uid } = get(user)
    try {
      const validatedChanges = User.schema.partial().parse(keyValueChanges)
      await updateFirestoreDoc(`/users/${uid}`, validatedChanges)
    } catch (error) {
      console.error("error in User.update", error)
      alert(`Error calling User.update: ${error.message}`)
    }
  }
}

export default User 