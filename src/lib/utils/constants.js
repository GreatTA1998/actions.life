export const COLORS = Object.freeze({
  OVERLAY_DARKEST: 'rgba(0,0,0,0.5)'
})

export const HEIGHTS = Object.freeze({
  MAIN_CONTENT_TOP_MARGIN: 24, // artificially match the dropzone for now, since CSS vars are hard to convert to rem
  ROOT_DROPZONE: 1.5, // 1.5rem = 24px (used directly by JS)
  SUB_DROPZONE: 1, // 1rem = 16px
  NAVBAR: 54,
  CORNER_LABEL: 110,
})

export const breakpoints = {
  mobile: 375, // iPhone SE
  tablet: 768,
  desktop: 1024
}

export const goldenRatio = 1.618

export const WIDTHS = Object.freeze({
  LIST: 380, // 320 --> 360 for masa
  CALENDAR_LEFT_PADDING: 16,
  MOBILE_TIME_AXIS: 22,
  DESKTOP_TIME_AXIS: 64,
  INDENT_PER_LEVEL: 24, // unified for both subtasks and dropzones
  PANEL_MAX: breakpoints.desktop / goldenRatio
})

export const MOBILE_SAFE_INSET = 48

export function translateJSConstantsToCSSVariables () {
  for (const [key, value] of Object.entries(WIDTHS)) {
    document.documentElement.style.setProperty(
      `--width-${key}`.toLowerCase().replace(/_/g, '-'),
      `${value}px`
    )
  }
  for (const [key, value] of Object.entries(HEIGHTS)) {
    document.documentElement.style.setProperty(
      `--height-${key}`.toLowerCase().replace(/_/g, '-'),
      `${value}px`
    )
  }
}