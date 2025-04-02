import { writable } from 'svelte/store'
import { browser } from '$app/environment'
import { user } from '/src/lib/store/userStore.js'
import { themes } from './definitions.js'

export { themes }

export const currentTheme = writable('naturalGreen')

user.subscribe($user => {
  if ($user?.calendarTheme) {
    setTheme($user.calendarTheme)
  }
})

function setTheme (theme) {
  currentTheme.set(theme)
  
  if (browser) {
    for (const [k, v] of Object.entries(themes[theme].cssVars)) {
      document.documentElement.style.setProperty(k, v)
    }
  }
}