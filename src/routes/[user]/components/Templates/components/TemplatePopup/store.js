import { writable } from 'svelte/store'

export const inputStates = writable({
  weekly: '',
  monthlyTypeI: '',
  monthlyTypeII: '',
  yearly: ''
})

export const monthlyInputSourceOfTruth = writable('')
export const overallSourceOfTruth = writable('')