import { DateTime } from 'luxon'

export const TOTAL_COLUMNS = 365
export const originDT = DateTime.now().startOf('day').minus({ days: Math.floor(TOTAL_COLUMNS / 2) })