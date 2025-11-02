export const HEIGHTS = Object.freeze({
  MAIN_CONTENT_TOP_MARGIN: 20,
  ROOT_DROPZONE: 1.5, // 1.5rem = 24px
  SUB_DROPZONE: 1, // 1rem = 16px
  NAVBAR: 54,
  CORNER_LABEL: 110,
})

export const WIDTHS = Object.freeze({
  CALENDAR_DAY_SECTION: 200,
  CALENDAR_LEFT_PADDING: 16,
  MOBILE_TIME_AXIS: 22,
  DESKTOP_TIME_AXIS: 64,
  INDENT_PER_LEVEL: 24, // unified for both subtasks and dropzones
})

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