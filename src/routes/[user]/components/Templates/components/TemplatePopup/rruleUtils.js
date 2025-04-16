// RRule utilities shared between pattern components

export const weekdayToRRule = {
  monday: 'MO',
  tuesday: 'TU',
  wednesday: 'WE',
  thursday: 'TH',
  friday: 'FR',
  saturday: 'SA',
  sunday: 'SU'
}

export const occurrenceToPosition = {
  first: '+1',
  second: '+2',
  third: '+3',
  fourth: '+4'
}

export const positionToOccurrence = {
  '+1': 'first',
  '+2': 'second',
  '+3': 'third',
  '+4': 'fourth'
}

export const rruleToWeekday = Object.fromEntries(
  Object.entries(weekdayToRRule).map(([key, value]) => [value, key])
) 