import { handleMcp } from '$lib/server/agent.js'

export function POST ({ request }) {
  return handleMcp(request)
}

export function GET ({ request }) {
  return handleMcp(request)
}

export function DELETE ({ request }) {
  return handleMcp(request)
}
