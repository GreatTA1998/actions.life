import { writable } from 'svelte/store'
import { DateTime } from 'luxon'

export const now = writable(DateTime.now())
