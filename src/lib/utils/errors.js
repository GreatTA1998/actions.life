import { dev } from '$app/environment'
import { randomID } from '$lib/utils/core.js'
import { user, loading } from '$lib/store'
import { get } from 'svelte/store'
import { setFirestoreDoc } from '$lib/db/helpers.js'
import { DateTime } from 'luxon'

let logs = 0
const limit = 10

export async function reportError ({ subject, content }) {
  loading.set(false)
  alert(`UNEXPECTED ERROR ${subject}: ${content}`)

  if (!dev && logs < limit) {
    setFirestoreDoc(`/errors/${randomID()}`, {
      subject, content,
      uid: get(user).uid || '',
      email: get(user).email || '',
      utc: DateTime.now().toFormat('yyyy-MM-dd'),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userAgent: navigator.userAgent
    })
    logs += 1
  }
}