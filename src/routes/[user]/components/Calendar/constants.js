import { DateTime } from 'luxon'
import { WIDTHS } from '$lib/utils/constants.js'

export const COLUMN_WIDTH = WIDTHS.CAL_COLUMN
export const TOTAL_COLUMNS = 365
export const c = 4 // for "cushion"

export const originDT = DateTime.now().startOf('day').minus({ days: Math.floor(TOTAL_COLUMNS / 2) })