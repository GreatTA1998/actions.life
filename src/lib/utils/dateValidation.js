export function isValidISODate (dateStr) {
  if (dateStr === '') return true
  if (typeof dateStr !== 'string') return false

  const isoFormatRegex = /^(\d{4})-(\d{2})-(\d{2})$/
  const match = dateStr.match(isoFormatRegex)
  if (!match) return false

  const [, yearRaw, monthRaw, dayRaw] = match
  const year = Number(yearRaw)
  const month = Number(monthRaw)
  const day = Number(dayRaw)

  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}
