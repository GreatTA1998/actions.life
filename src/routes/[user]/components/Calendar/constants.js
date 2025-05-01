import { DateTime } from 'luxon'

export const TOTAL_COLUMNS = 365
export const COLUMN_WIDTH = 200
export const c = 4 // for "cushion"

export const originDT = DateTime.now().startOf('day').minus({ days: TOTAL_COLUMNS / 2 })