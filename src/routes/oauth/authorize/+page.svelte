<script>
  import { page } from '$app/state'
  import { firebaseAuth, authChecked } from '$lib/store'
  import { requestGoogleSignIn } from '$lib/features/google-calendar/GIS.js'
  import { signInAnonymously, getAdditionalUserInfo } from 'firebase/auth'
  import User from '$lib/db/models/User.js'
  import { calendarDensity } from '$lib/utils/constants.js'

  let { form } = $props()

  const params = $derived(page.url.searchParams)
  const clientHost = $derived.by(() => {
    try { return new URL(params.get('redirect_uri') || '').host } catch { return 'This app' }
  })

  async function allow (event) {
    event.preventDefault()
    const current = $firebaseAuth.currentUser
    if (!current?.email) return
    const formElement = event.currentTarget
    formElement.elements.idToken.value = await current.getIdToken()
    formElement.submit()
  }

  async function continueWithGoogle () {
    sessionStorage.setItem('agent-oauth-return', location.pathname + location.search)
    if (!$firebaseAuth.currentUser) {
      const result = await signInAnonymously($firebaseAuth)
      if (getAdditionalUserInfo(result).isNewUser) {
        await User.create({ ...result.user, uid: result.user.uid, ...calendarDensity.wide })
      }
    }
    await requestGoogleSignIn()
  }
</script>

<div class="mx-auto max-w-md p-6">
  <h1 class="mb-2 text-lg">Connect an agent</h1>
  <p class="mb-4 text-sm">{clientHost} is asking to read and change your actions.</p>

  {#if form?.message}
    <p class="mb-4 text-sm text-red-700">{form.message}</p>
  {/if}

  {#if !$authChecked}
    <p class="text-sm">Checking your account…</p>
  {:else if $firebaseAuth?.currentUser?.email}
    <form method="POST" action="?/allow" onsubmit={allow}>
      <input type="hidden" name="idToken" value="" />
      <input type="hidden" name="client_id" value={params.get('client_id') || ''} />
      <input type="hidden" name="redirect_uri" value={params.get('redirect_uri') || ''} />
      <input type="hidden" name="code_challenge" value={params.get('code_challenge') || ''} />
      <input type="hidden" name="code_challenge_method" value={params.get('code_challenge_method') || ''} />
      <input type="hidden" name="state" value={params.get('state') || ''} />
      <button class="rounded-full border border-black/20 px-3.5 py-2.5 text-sm">Allow</button>
    </form>
  {:else}
    <button type="button" class="rounded-full border border-black/20 px-3.5 py-2.5 text-sm" onclick={continueWithGoogle}>
      Continue with Google
    </button>
  {/if}
</div>
