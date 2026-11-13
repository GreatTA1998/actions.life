import { fail, redirect, isRedirect } from '@sveltejs/kit'
import { approveConsent } from '$lib/server/agent.js'

export const actions = {
  allow: async ({ request }) => {
    const form = await request.formData()
    try {
      const location = await approveConsent({
        idToken: form.get('idToken'),
        clientId: form.get('client_id'),
        redirectUri: form.get('redirect_uri'),
        challenge: form.get('code_challenge'),
        method: form.get('code_challenge_method'),
        state: form.get('state')
      })
      redirect(303, location)
    } catch (error) {
      if (isRedirect(error)) throw error
      return fail(400, { message: error.message })
    }
  }
}
