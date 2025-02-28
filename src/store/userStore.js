import { writable } from 'svelte/store'

export const user = writable({}) // {} means not logged in, cannot be null