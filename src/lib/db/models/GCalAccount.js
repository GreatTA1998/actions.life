import { z } from 'zod'
import { updateFirestoreDoc } from '$lib/db/helpers.js'
import { user } from '$lib/store'
import { get } from 'svelte/store'

const GCalAccount = {
  schema: z.object({
    id: z.string(),
    email: z.string().email(),
    refreshToken: z.object({
      value: z.string()
    }),
    accessToken: z.string().optional(),
    opacity: z.number().default(0.9),
    selectedCalIDs: z.array(z.string()).default([])
  }),

  async update (accountID, kvChanges) {
    const { uid } = get(user)
    const validatedChanges = GCalAccount.schema.partial().parse(kvChanges)
    return updateFirestoreDoc(`/users/${uid}/googleAccounts/${accountID}`, validatedChanges)
  }
}

export default GCalAccount
