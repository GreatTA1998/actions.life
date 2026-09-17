import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const roots = process.argv.slice(2)
const scanRoots = roots.length ? roots : ['build']
const callbackRe = /https:\/\/[^"'\\\s]+\/auth\/callback/g

function walk (dir, acc = []) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return acc
  }
  for (const name of entries) {
    const path = join(dir, name)
    let st
    try {
      st = statSync(path)
    } catch {
      continue
    }
    if (st.isDirectory()) walk(path, acc)
    else if (/\.(js|html|json|css)$/.test(name)) acc.push(path)
  }
  return acc
}

const found = new Map()
for (const root of scanRoots) {
  for (const file of walk(root)) {
    const text = readFileSync(file, 'utf8')
    for (const match of text.match(callbackRe) || []) {
      const files = found.get(match) || []
      files.push(file)
      found.set(match, files)
    }
  }
}

const urls = [...found.keys()].sort()
console.log(`[build:native] baked /auth/callback URLs in ${scanRoots.join(', ')}:`)
if (!urls.length) {
  console.log('  (none found)')
} else {
  for (const url of urls) {
    console.log(`  ${url}  (${found.get(url).length} file${found.get(url).length === 1 ? '' : 's'})`)
  }
}

const production = 'https://actions.life/auth/callback'
if (urls.length === 1 && urls[0] === production) {
  console.warn(
    '[build:native] WARNING: bundle only has the production redirect. Copy .env.example → .env.local and set PUBLIC_NATIVE_OAUTH_REDIRECT to a preview callback that bounces, then rebuild. A shell `export` alone is not enough for adapter-static.'
  )
}
