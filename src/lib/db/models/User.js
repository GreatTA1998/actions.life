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
    fontScale: z.number().default(1),
    defaultPhotoLayout: z.string().default('split-view'),
    calSnapInterval: z.number().default(1),
    listAreaWidthRatio: z.number().default(0.00223), // empirically determined from my account
    listAreaHeightRatio: z.number().default(0.004), // for mobile top-below view, default to 40% of viewport height
    listWidthSplit: z.number().default(0.34), // one list column on a 1440px laptop
    listHeightSplit: z.number().default(0.5),

    // automation settings
    simpleMode: z.boolean().default(false),
    photoUploadAutoArchive: z.boolean().default(false),
    photoCompressWhenAttachingToTask: z.boolean().default(true), // NOTE: despite the name, this setting applies to ALL photo uploads (task attachments + MultiPhotoUploader)

    // Missing on accounts created before this experiment, which the UI treats as on.
    // User.create writes false so only new accounts start with these off.
    scheduleEnabled: z.boolean().default(true),
    repeatEnabled: z.boolean().default(true),
    photoEnabled: z.boolean().default(true),

    hideRoutines: z.boolean().default(true), // for mobile's future view
    lastRanRoutines: z.string().default(''), // for autoExtend.js
    nickname: z.string().default(''),
    avatarFilter: z.string().default(''),

    tags: z.record(z.object({ color: z.string(), name: z.string()})).default({}),
    pixelsPerHour: z.number(),
    calColumnWidth: z.number(),

    selectedGoogleCalendarIds: z.array(z.string()).optional() // to deprecate
  }),

  async create (currentUser) {
    const validatedUser = User.schema.parse({
      ...currentUser,
      email: '',
      scheduleEnabled: false,
      repeatEnabled: false,
      photoEnabled: false,
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