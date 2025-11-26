import { writable } from 'svelte/store'
import { user } from '/src/lib/store/userStore.js'

export const calSnapInterval = writable(5)
export const timestamps = writable(Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`))

user.subscribe($user => {
  if (!$user) {
    return
  }
  calSnapInterval.set($user.calSnapInterval || 5)
})