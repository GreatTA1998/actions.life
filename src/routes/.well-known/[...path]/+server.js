import { json, error } from '@sveltejs/kit'
import { authorizationServer, protectedResource } from '$lib/server/agent.js'

const resources = new Set(['oauth-protected-resource', 'oauth-protected-resource/mcp'])

export function GET ({ url, params }) {
  if (resources.has(params.path)) return json(protectedResource(url.origin))
  if (params.path === 'oauth-authorization-server') return json(authorizationServer(url.origin))
  error(404, 'Not found')
}
