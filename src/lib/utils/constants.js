export const HEIGHTS = Object.freeze({
  MAIN_CONTENT_TOP_MARGIN: 24, // artificially match the dropzone for now, since CSS vars are hard to convert to rem
  ROOT_DROPZONE: 1.5, // 1.5rem = 24px (used directly by JS)
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

// Mobile-optimized font sizes (increased for better readability)
export const FONT_SIZES = Object.freeze({
  XS: 15,      // was 12px -> 25% larger
  SM: 16,      // was 13px -> 23% larger
  MD: 17,      // was 14px -> 21% larger
  BASE: 18,    // was 15px -> 20% larger
  LG: 19,      // was 16px -> 19% larger
  XL: 24,      // was 20px -> 20% larger
  XXL: 28,     // was 24px -> 17% larger
  XXXL: 36,    // was 30px -> 20% larger
  HUGE: 56,    // was 48px -> 17% larger
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
  for (const [key, value] of Object.entries(FONT_SIZES)) {
    document.documentElement.style.setProperty(
      `--font-size-${key}`.toLowerCase().replace(/_/g, '-'),
      `${value}px`
    )
  }
}