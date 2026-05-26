import { z } from 'zod'
import { setFirestoreDoc, updateFirestoreDoc } from '$lib/db/helpers.js'
import { user } from '$lib/store'
import { get } from 'svelte/store'

const GCalAccount = {
  schema: z.object({
    id: z.string(),
    email: z.string().email(),
    refreshToken: z.object({ value: z.string() }),
    accessToken: z.object({ value: z.string() }),
    opacity: z.number().default(0.9),
    selectedCalIDs: z.array(z.string()),
    allCals: z.array(z.record(z.any()))
  }),

  async create (email, id, { refresh_token, access_token, scope }) {
    const kvChanges = {
      email, 
      id,
      scope,
      refreshToken: { value: refresh_token },
      accessToken: { value: access_token },
      selectedCalIDs: [],
      allCals: [],
      opacity: 0.9
    }

    const validatedChanges = GCalAccount.schema.partial().parse(kvChanges)
    return setFirestoreDoc(`/users/${uid}/googleAccounts/${id}`, validatedChanges)
  },

  async update (accountID, kvChanges) {
    const { uid } = get(user)
    const validatedChanges = GCalAccount.schema.partial().parse(kvChanges)
    return updateFirestoreDoc(`/users/${uid}/googleAccounts/${accountID}`, validatedChanges)
  }
}

export default GCalAccount
