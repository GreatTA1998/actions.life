import { writable, get } from 'svelte/store'
import { browser } from '$app/environment'
import { user } from '/src/store'

export const themeColors = writable({
  todoList: '',
  calendar: '',
  navbar: '',
  gridline: ''
})

export const naturalGreen = 'hsl(98, 40%, 90%)'
export const offWhite = '#f8f9f9'
export const sunshineOrange = 'hsl(45, 100%, 92%)'

// Map theme names to CSS class names
const themeClassMap = {
  'naturalGreen': 'theme-natural-green',
  'sunshineOrange': 'theme-sunshine-orange',
  'offWhite': 'theme-off-white'
};

if (browser) {
  // Subscribe to user changes
  user.subscribe($user => {
    if ($user && $user.calendarTheme) {
      setCalendarTheme($user.calendarTheme)
    } else {
      // Default theme if user preferences aren't available
      setCalendarTheme('naturalGreen')
    }
  })
}

export function setCalendarTheme(theme = 'naturalGreen') {
  if (browser) {
    // Remove all theme classes first
    document.documentElement.classList.remove(
      'theme-natural-green',
      'theme-sunshine-orange',
      'theme-off-white'
    );
    
    // Add the appropriate theme class
    const themeClass = themeClassMap[theme] || 'theme-natural-green';
    document.documentElement.classList.add(themeClass);
    
    // Also update the themeColors store for components that might depend on it
    if (theme === 'sunshineOrange') setSunshineOrangeTheme()
    else if (theme === 'naturalGreen') setNaturalGreenTheme()
    else if (theme === 'offWhite') setOffWhiteTheme()
  }
}

function setSunshineOrangeTheme() {
  themeColors.set({
    todoList: 'hsl(45, 100%, 90%)',
    calendar: sunshineOrange,
    navbar: 'hsl(45, 100%, 93%)',
    gridline: 'hsl(45, 80%, 85%)'
  })
}

function setNaturalGreenTheme() {
  themeColors.set({
    todoList: 'hsl(100, 40%, 86%)', 
    calendar: naturalGreen,
    navbar: 'hsla(98, 30%, 94%)',
    gridline: 'hsl(98, 30%, 80%)'
  })
}

function setOffWhiteTheme() {
  themeColors.set({
    todoList: offWhite,
    calendar: offWhite,
    navbar: offWhite,
    gridline: 'rgb(228, 228, 228)'
  })
}