// NOTE: right now there are 2 sources of truth: here and in <calendarStore.js>
// lazy loading variables
export const size = 4
export const cushion = 6

export const HEIGHTS = Object.freeze({
  MAIN_CONTENT_TOP_MARGIN: 20,
  ROOT_DROPZONE: 24,
  SUB_DROPZONE: 18,
  NAVBAR: 54,
  CORNER_LABEL: 110,
})

export const WIDTHS = Object.freeze({
  CALENDAR_DAY_SECTION: 200,
  CALENDAR_LEFT_PADDING: 16,
  MOBILE_TIME_AXIS: 30,
  DESKTOP_TIME_AXIS: 64,
  SUBTASK_LEFT_MARGIN: 32,
  DROPZONE_LEFT_MARGIN: 32
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