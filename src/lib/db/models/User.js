import { z } from 'zod'
import { setFirestoreDoc, updateFirestoreDoc } from '$lib/db/helpers.js'
import { user } from '$lib/store'
import { get } from 'svelte/store'

const User = {
  schema: z.object({
    uid: z.string(),
    email: z.string(),
    maxOrderValue: z.number().default(10),

    calendarTheme: z.string().default('mutedEarth'),
    defaultPhotoLayout: z.string().default('split-view'),
    calSnapInterval: z.number().default(1),
    listAreaWidthRatio: z.number().default(0.00223), // empirically determined from my account
    listAreaHeightRatio: z.number().default(0.004), // for mobile top-below view, default to 40% of viewport height
    listWidthSplit: z.number().default(0.5),
    listHeightSplit: z.number().default(0.5),

    // automation settings
    simpleMode: z.boolean().default(false),
    photoUploadAutoArchive: z.boolean().default(false),
    photoCompressWhenAttachingToTask: z.boolean().default(true), // NOTE: despite the name, this setting applies to ALL photo uploads (task attachments + MultiPhotoUploader)

    hideRoutines: z.boolean().default(true), // for mobile's future view
    lastRanRoutines: z.string().default(''), // for autoExtend.js
    nickname: z.string().default(''),
    avatarFilter: z.string().default(''),

    tags: z.record(z.object({ color: z.string(), name: z.string()})).default({}),
    pixelsPerHour: z.number().default(80),
    calColumnWidth: z.number().default(260),

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