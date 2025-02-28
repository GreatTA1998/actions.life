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
export const sunshineOrange = 'oklch(0.92 0.08 72.71)'

if (browser) {
  user.subscribe($user => {
    setCalendarTheme($user.calendarTheme)
  })

  themeColors.subscribe($themeColors => {
    document.documentElement.style.setProperty('--todo-list-bg-color', $themeColors.todoList)
    document.documentElement.style.setProperty('--calendar-bg-color', $themeColors.calendar)
    document.documentElement.style.setProperty('--navbar-bg-color', $themeColors.navbar)
    document.documentElement.style.setProperty('--grid-color', $themeColors.gridline)
  })
}

export function setCalendarTheme (theme = 'naturalGreen') {
  if (theme === 'sunshineOrange') setSunshineOrangeTheme()
  else if (theme === 'naturalGreen') setNaturalGreenTheme()
  else if (theme === 'offWhite') setOffWhiteTheme()
}

function setSunshineOrangeTheme () {
  themeColors.set({
    todoList: 'oklch(0.9 0.1 72.14)',
    calendar: sunshineOrange,
    navbar: 'oklch(0.93 0.07 72.54)',
    gridline: 'oklch(0.85 0.09 72.71)'
  })
}

function setNaturalGreenTheme () {
  themeColors.set({
    todoList: 'hsl(100, 40%, 86%)', 
    calendar: naturalGreen,
    navbar: 'hsla(98, 30%, 94%)',
    gridline: 'hsl(98, 30%, 80%)'
  })
}

function setOffWhiteTheme () {
  themeColors.set({
    todoList: offWhite,
    calendar: offWhite,
    navbar: offWhite,
    gridline: 'rgb(228, 228, 228)'
  })
}