import { writable } from 'svelte/store'
import { browser } from '$app/environment'
import { user } from '/src/lib/store/userStore.js'
import { themes } from './definitions.js'

export { themes }

export const currentTheme = writable('offWhite')
export const COLOR_MODES = ['system', 'light', 'dark']
export const currentColorMode = writable('system')

const COLOR_MODE_STORAGE_KEY = 'actions-life-color-mode'
const systemDarkQuery = browser
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : null

let currentModeValue = 'system'

if (browser && systemDarkQuery?.addEventListener) {
  systemDarkQuery.addEventListener('change', () => {
    if (currentModeValue === 'system') {
      applyColorMode('system')
    }
  })
} else if (browser && systemDarkQuery?.addListener) {
  systemDarkQuery.addListener(() => {
    if (currentModeValue === 'system') {
      applyColorMode('system')
    }
  })
}

setTheme('offWhite')

if (browser) {
  const storedMode = sanitizeColorMode(localStorage.getItem(COLOR_MODE_STORAGE_KEY))
  setColorMode(storedMode, { persist: false })
}

user.subscribe($user => {
  if ($user?.calendarTheme) {
    setTheme($user.calendarTheme)
  }

  if ($user?.colorMode) {
    setColorMode($user.colorMode)
  } else if ($user?.uid) {
    setColorMode('system')
  }
})

export function setTheme (theme) {
  if (!themes[theme]) { // needed due to new backwards compatibility between new version themes and old version themes
    console.warn(`Theme '${theme}' not found, falling back to 'offWhite'`)
    theme = 'offWhite'
  }

  currentTheme.set(theme)
  
  if (browser) {
    for (const [k, v] of Object.entries(themes[theme].cssVars)) {
      document.documentElement.style.setProperty(k, v)
    }
  }
}

export function setColorMode (mode, { persist = true } = {}) {
  const safeMode = sanitizeColorMode(mode)

  currentModeValue = safeMode
  currentColorMode.set(safeMode)

  if (!browser) return

  if (persist) {
    localStorage.setItem(COLOR_MODE_STORAGE_KEY, safeMode)
  }

  applyColorMode(safeMode)
}

function applyColorMode (mode) {
  const effectiveMode = mode === 'system'
    ? (systemDarkQuery?.matches ? 'dark' : 'light')
    : mode

  document.documentElement.classList.toggle('dark', effectiveMode === 'dark')
  document.documentElement.dataset.theme = effectiveMode
  document.documentElement.dataset.colorMode = mode
  document.documentElement.style.colorScheme = effectiveMode
}

function sanitizeColorMode (mode) {
  return COLOR_MODES.includes(mode) ? mode : 'system'
}