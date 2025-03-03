import { writable } from 'svelte/store'
import { browser } from '$app/environment'
import { user } from './userStore.js'

// Theme definitions with their CSS variables
const themes = {
  naturalGreen: {
    value: 'hsl(98, 40%, 90%)',
    variables: {
      '--todo-list-bg-color': 'hsl(100, 40%, 86%)',
      '--calendar-bg-color': 'hsl(98, 40%, 90%)',
      '--navbar-bg-color': 'hsla(98, 30%, 94%)',
      '--grid-color': 'hsl(98, 30%, 80%)'
    }
  },
  sunshineOrange: {
    value: 'oklch(0.92 0.08 72.71)',
    variables: {
      '--todo-list-bg-color': 'oklch(0.9 0.1 72.14)',
      '--calendar-bg-color': 'oklch(0.92 0.08 72.71)',
      '--navbar-bg-color': 'oklch(0.93 0.07 72.54)',
      '--grid-color': 'oklch(0.85 0.09 72.71)'
    }
  },
  offWhite: {
    value: '#f8f9f9',
    variables: {
      '--todo-list-bg-color': '#f8f9f9',
      '--calendar-bg-color': '#f8f9f9',
      '--navbar-bg-color': '#f8f9f9',
      '--grid-color': 'rgb(228, 228, 228)'
    }
  }
}

// Export theme values for direct use in components
export const { naturalGreen, sunshineOrange, offWhite } = Object.fromEntries(
  Object.entries(themes).map(([key, theme]) => [key, theme.value])
)

// Export theme names as enum
export const THEMES = Object.keys(themes).reduce((acc, key) => {
  // Convert camelCase to UPPER_SNAKE_CASE
  const enumKey = key
    .replace(/([A-Z])/g, '_$1') // Add underscore before capital letters
    .toUpperCase() // Convert to uppercase
    .replace(/^_/, '') // Remove leading underscore if present
  acc[enumKey] = key
  return acc
}, {})

export const currentTheme = writable(THEMES.NATURAL_GREEN)

/**
 * Sets the calendar theme by applying the appropriate CSS variables
 * @param {string} theme - Theme name from THEMES object
 */
export function setCalendarTheme(theme = THEMES.NATURAL_GREEN) {
  if (!browser) return
  
  currentTheme.set(theme)
  
  const html = document.documentElement
  const variables = themes[theme]?.variables

  if (variables) {
    Object.entries(variables).forEach(([key, value]) => {
      html.style.setProperty(key, value)
    })
  }
}

// Initialize theme when this module is imported
if (browser) {
  user.subscribe($user => {
    if ($user?.calendarTheme) {
      setCalendarTheme($user.calendarTheme)
    } else {
      setCalendarTheme(THEMES.NATURAL_GREEN)
    }
  })
}