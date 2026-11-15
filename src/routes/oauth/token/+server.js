import { exchangeToken } from '$lib/server/agent.js'

export async function POST ({ request }) {
  try {
    return Response.json(await exchangeToken(await request.formData()))
  } catch (error) {
    return Response.json(
      { error: error.code || 'invalid_grant', error_description: error.message },
      { status: error.code === 'server_error' ? 500 : 400 }
    )
  }
}
