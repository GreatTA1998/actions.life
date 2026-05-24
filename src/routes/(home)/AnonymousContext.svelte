<script>
  import { ensureAnonymousSession } from '$lib/auth/anonymous.js'
  import { onMount } from 'svelte'

  let { children } = $props()

  let uid = $state('')

  onMount(async () => {
    uid = (await ensureAnonymousSession()).uid
  })
</script>

{@render children(uid)}
