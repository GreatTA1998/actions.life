import { DateTime } from 'luxon'

const ANONYMOUS_SPECIES = [
  'sparrow',
  'bluebird',
  'finch',
  'mallard',
  'wren',
  'heron',
  'swallow',
  'canary',
  'hummingbird'
]

/** Random display name: `Anonymous` + one capitalized bird species (e.g. `Anonymous Finch`). */
export function randomAnonymousNickname () {
  const species = ANONYMOUS_SPECIES[Math.floor(Math.random() * ANONYMOUS_SPECIES.length)]
  const speciesLabel = species.charAt(0).toUpperCase() + species.slice(1)
  return `Anonymous ${speciesLabel}`
}

export function formatChatTimestamp (ms) {
  const dt = DateTime.fromMillis(ms)
  const now = DateTime.now()
  if (dt.hasSame(now, 'day')) return dt.toFormat('h:mm a')
  if (dt.hasSame(now, 'week')) return dt.toFormat('ccc · h:mm a')
  if (dt.hasSame(now, 'year')) return dt.toFormat('MMM d')
  return dt.toFormat('MMM d, yyyy')
}

/** Stable hue 0–360 for avatar background */
export function chatAvatarHue (uid) {
  let h = 0
  for (let i = 0; i < uid.length; i++) h = (h + uid.charCodeAt(i) * (i + 1)) % 360
  return h
}

/** Stable 0–9 index for zen-bird CSS filter presets */
export function chatAvatarVariant (uid) {
  return chatAvatarHue(uid) % 10
}

export function chatInitials (name) {
  const p = name.trim().split(/\s+/).filter(Boolean)
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase().slice(0, 2)
  return name.slice(0, 2).toUpperCase()
}
