import { z } from 'zod'
import { setFirestoreDoc, updateFirestoreDoc } from '$lib/db/helpers.js'
import { user } from '$lib/store'
import { get } from 'svelte/store'

const User = {
  schema: z.object({
    uid: z.string(),
    email: z.string(),
    maxOrderValue: z.number().default(10),

    // properties introduced from August 1 2024, maybe
    calendarTheme: z.string().default('google'),

    defaultPhotoLayout: z.string().default('side-by-side'),
    calSnapInterval: z.number().default(1),
    listAreaWidthRatio: z.number().default(0.00223), // empirically determined from my account
    listAreaHeightRatio: z.number().default(0.004), // for mobile top-below view, default to 40% of viewport height
    listWidthSplit: z.number().default(0.5),
    listHeightSplit: z.number().default(0.5),

    // automation settings
    simpleMode: z.boolean().default(true),
    photoUploadAutoArchive: z.boolean().default(false),
    photoCompressWhenAttachingToTask: z.boolean().default(false), // NOTE: despite the name, this setting applies to ALL photo uploads (task attachments + MultiPhotoUploader)

    hideRoutines: z.boolean().default(true), // for mobile's future view
    lastRanRoutines: z.string().default(''), // for autoExtend.js
    nickname: z.string().default(''),
    avatarFilter: z.string().default(''),

    // needed temporarily for backwards compatibility
    hasGridlines: z.boolean().default(true),
    calEarliestHHMM: z.string().default('00:00'),
    calLastHHMM: z.string().default('23:59'),
    tags: z.record(z.object({ color: z.string(), name: z.string()})).default({}),

    selectedGoogleCalendarIds: z.array(z.string()).optional() // to deprecate
  }),

  async create (currentUser) {
    const validatedUser = User.schema.parse({
      ...currentUser,
      email: ''
    })
    await setFirestoreDoc(`/users/${validatedUser.uid}`, 
      validatedUser
    )
    return validatedUser
  },

  async update (kvChanges) {
    const { uid } = get(user)
    const validatedChanges = User.schema.partial().parse(kvChanges)
    return updateFirestoreDoc(`/users/${uid}`, validatedChanges) 
  }
}

export default User 