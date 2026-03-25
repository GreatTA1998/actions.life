import { DateTime } from 'luxon'

const ANONYMOUS_SPECIES = [
  'sparrow',
  'bluebird',
  'finch',
  'mallard',
  'wren',
  'heron',
  'canary',
  'hummingbird'
]

/** Random display name: `Anonymous` + one capitalized bird species (e.g. `Anonymous Finch`). */
export function randomAnonymousNickname () {
  const species = ANONYMOUS_SPECIES[Math.floor(Math.random() * ANONYMOUS_SPECIES.length)]
  const speciesLabel = species.charAt(0).toUpperCase() + species.slice(1)
  return `Anonymous ${speciesLabel}`
}

/** Relative time from now, e.g. "10 minutes ago", "1 hour ago" (Luxon `toRelative`). */
export function formatChatTimestamp (ms) {
  const dt = DateTime.fromMillis(ms)
  const now = DateTime.now()
  return dt.toRelative({ base: now }) ?? dt.toFormat('MMM d, yyyy')
}

/**
 * Distinct replier uids under `parentId`, newest reply first (for Slack-style stacked mini-avatars).
 * @param {{ parentID: string | null, uid: string, serverTimestamp: number }[]} messages
 * @param {string} parentId
 * @param {number} [max]
 */
export function replyParticipantUidsForParent (messages, parentId, max = 3) {
  const replies = messages.filter(m => m.parentID === parentId)
  replies.sort((a, b) => b.serverTimestamp - a.serverTimestamp)
  const seen = new Set()
  const uids = []
  for (const r of replies) {
    if (seen.has(r.uid)) continue
    seen.add(r.uid)
    uids.push(r.uid)
    if (uids.length >= max) break
  }
  return uids
}

/** Stable hue 0–360 for avatar background */
export function chatAvatarHue (uid) {
  let h = 0
  for (let i = 0; i < uid.length; i++) h = (h + uid.charCodeAt(i) * (i + 1)) % 360
  return h
}

/** Stable 0–9 index for zen-bird CSS filter presets */
export function chatAvatarVariant (uid) {
  return chatAvatarHue(uid) % 6
}

export function chatInitials (name) {
  const p = name.trim().split(/\s+/).filter(Boolean)
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase().slice(0, 2)
  return name.slice(0, 2).toUpperCase()
}
