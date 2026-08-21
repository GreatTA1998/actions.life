const REPO = 'https://api.github.com/repos/project-feynman/actions.life'

export async function load ({ fetch, setHeaders }) {
  setHeaders({ 'cache-control': 'public, max-age=600' })
  try {
    const res = await fetch(REPO, {
      headers: { Accept: 'application/vnd.github+json' }
    })
    if (!res.ok) return { stars: null }
    const repo = await res.json()
    return { stars: repo.stargazers_count ?? null }
  } catch {
    return { stars: null }
  }
}
