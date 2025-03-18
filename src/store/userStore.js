// This module was created to avoid circular dependencies between store modules, though there could be a better way
import { writable } from 'svelte/store'

export const user = writable({}) // {} means not logged in, cannot be null