export const AVATAR_FILTERS = [
  'hue-rotate(0deg) saturate(0.9) brightness(1.08)',
  'hue-rotate(24deg) saturate(1.18) brightness(0.98)',
  'hue-rotate(48deg) saturate(1.22) brightness(1.0)',
  'hue-rotate(96deg) saturate(1.04) brightness(1.09)',
  'hue-rotate(136deg) saturate(1.1) brightness(1.03)',
  'hue-rotate(192deg) saturate(1.06) brightness(1.06)',
  'hue-rotate(336deg) saturate(0.88) brightness(1.0)',
]

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

export function randomAvatarFilter () {
  const i = Math.floor(Math.random() * AVATAR_FILTERS.length)
  return AVATAR_FILTERS[i]
}

/** Random display name: `Anonymous` + one capitalized bird species (e.g. `Anonymous Finch`). */
export function randomAnonymousNickname () {
  const species = ANONYMOUS_SPECIES[Math.floor(Math.random() * ANONYMOUS_SPECIES.length)]
  const speciesLabel = species.charAt(0).toUpperCase() + species.slice(1)
  return `Anonymous ${speciesLabel}`
}