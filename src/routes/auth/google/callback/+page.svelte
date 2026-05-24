<script>
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { page } from '$app/state'
  import { completeGoogleAuth } from '$lib/features/google-calendar/GIS.js'

  let error = $state('')

  onMount(async () => {
    const params = page.url.searchParams

    if (params.get('error')) {
      error = params.get('error_description') || params.get('error')
      return
    }

    const code = params.get('code')
    const state = params.get('state')
    if (!code) {
      error = 'No authorization code received'
      return
    }

    try {
      const { redirectTo } = await completeGoogleAuth(code, state)
      await goto(redirectTo, { replaceState: true, invalidateAll: true })
    } catch (err) {
      console.error(err)
      error = err.message
    }
  })
</script>

<div class="min-h-screen flex flex-col items-center justify-center gap-4 p-8 text-center">
  {#if error}
    <p class="text-red-600">{error}</p>
    <a href="/" class="text-sm underline text-neutral-600">Back to home</a>
  {:else}
    <p class="text-neutral-600">Finishing sign-in…</p>
  {/if}
</div>
