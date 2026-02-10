import { writable } from 'svelte/store'

export const tasksCache = writable({}) // id -> Task, '' -> undefined

// NOTE: this must be called for every listener, otherwise unexpected code that relies on `tasksCache` will break
// latest bug was due to `updateCache` not being used for the itinerary listener. 
// in the future, redesign the cache such that it's coupled with listeners
export function updateCache (tasks) {
  tasksCache.update(cache => {
    for (const task of tasks) {
      cache[task.id] = task
    }
    return cache
  })
}

export function cleanupCache (tasks) {
  tasksCache.update(cache => {
    for (const task of tasks) {
      delete cache[task.id]
    }
    return cache
  })
}