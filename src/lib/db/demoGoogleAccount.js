import { deleteDoc, doc, setDoc } from 'firebase/firestore'
import { db } from '$lib/db/init.js'

// Resolved server-side. Never a Google refresh token or access token.
const DEMO_REFRESH_SENTINEL = 'demo'

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

export function linkDemoGoogleCalendarAccount (uid) {
  return setDoc(doc(db, `users/${uid}/googleAccounts/${account.id}`), {
    ...account,
    refreshToken: { lastUsed: '', value: DEMO_REFRESH_SENTINEL },
    accessToken: { expiryDate: 0, value: '' },
  })
}

export function unlinkDemoGoogleCalendarAccount (uid, linkedAccountId) {
  if (linkedAccountId === account.id) return
  return deleteDoc(doc(db, `users/${uid}/googleAccounts/${account.id}`))
}
