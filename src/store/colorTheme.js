import { writable } from 'svelte/store'
import { browser } from '$app/environment'
import { user } from '/src/store'

// Theme constants - used for reference and by components that need direct color values
export const naturalGreen = 'hsl(98, 40%, 90%)'
export const offWhite = '#f8f9f9'
export const sunshineOrange = 'oklch(0.92 0.08 72.71)' // Original OKLCH value

// Available themes
export const THEMES = {
  NATURAL_GREEN: 'naturalGreen',
  SUNSHINE_ORANGE: 'sunshineOrange',
  OFF_WHITE: 'offWhite'
}

// Map theme names to CSS class names
const themeClassMap = {
  [THEMES.NATURAL_GREEN]: 'theme-natural-green',
  [THEMES.SUNSHINE_ORANGE]: 'theme-sunshine-orange',
  [THEMES.OFF_WHITE]: 'theme-off-white'
}

// Store for current theme (for components that need to know the current theme)
export const currentTheme = writable(THEMES.NATURAL_GREEN)

if (browser) {
  user.subscribe($user => {
    if ($user && $user.calendarTheme) {
      alert(`$user.calendarTheme ${$user.calendarTheme}`)
      setCalendarTheme($user.calendarTheme)
    } else {
      // Default theme if user preferences aren't available
      setCalendarTheme(THEMES.NATURAL_GREEN)
    }
  })
}

/**
 * Sets the calendar theme by applying the appropriate CSS class
 * @param {string} theme - Theme name from THEMES object
 */
export function setCalendarTheme(theme = THEMES.NATURAL_GREEN) {
  if (!browser) return
  
  alert(`Setting theme to: ${theme}`)
  currentTheme.set(theme)
  
  const html = document.documentElement
  
  // Remove all theme classes first
  Object.values(themeClassMap).forEach(className => {
    html.classList.remove(className)
  })
  
  // Add the appropriate theme class
  const themeClass = themeClassMap[theme] || themeClassMap[THEMES.NATURAL_GREEN]
  html.classList.add(themeClass)
}