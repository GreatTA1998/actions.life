import { deleteDoc, doc, setDoc } from 'firebase/firestore'
import { db } from '$lib/db/init.js'
import { cloudFunction } from '$lib/utils/cloudFunctions.js'

const DEMO_GOOGLE_ACCOUNT_ID = '111834572719576342755'

const HOLIDAYS_ID = 'en.japanese#holiday@group.v.calendar.google.com'
const PRIMARY_ID = 'linelton98@gmail.com'

const account = {
  id: DEMO_GOOGLE_ACCOUNT_ID,
  email: PRIMARY_ID,
  opacity: 0.5,
  scope: 'https://www.googleapis.com/auth/calendar.readonly',
  selectedCalIDs: [HOLIDAYS_ID, PRIMARY_ID],
  allCals: [
    {
      id: PRIMARY_ID,
      summary: PRIMARY_ID,
      backgroundColor: '#9fe1e7',
      foregroundColor: '#000000',
    },
    {
      id: HOLIDAYS_ID,
      summary: 'Holidays in Japan',
      backgroundColor: '#16a765',
      foregroundColor: '#000000',
    },
  ],
}

export async function linkDemoGoogleCalendarAccount (uid) {
  const { data } = await cloudFunction('fetchDemoGoogleTokens')
  return setDoc(doc(db, `users/${uid}/googleAccounts/${account.id}`), {
    ...account,
    refreshToken: { lastUsed: '', value: data.refreshToken },
    accessToken: { expiryDate: data.expiryDate, value: data.accessToken },
  })
}

export function unlinkDemoGoogleCalendarAccount (uid, linkedAccountId) {
  if (linkedAccountId === account.id) return
  return deleteDoc(doc(db, `users/${uid}/googleAccounts/${account.id}`))
}
