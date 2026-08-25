<script>
  import GoogleLogo from '$lib/components/GoogleLogo.svelte'
  import { requestGoogleSignIn } from '$lib/features/google-calendar/GIS.js'
</script>

<button
  onclick={requestGoogleSignIn}
  class="inline-flex items-center gap-1.5 rounded-full border border-solid border-black/20 bg-transparent px-3.5 py-2.5 text-sm leading-none tracking-[-0.015em] text-gray-500 transition-colors hover:border-black/30 hover:text-gray-700"
>
  <span class="size-3.5 shrink-0">
    <GoogleLogo />
  </span>
  Sign in with Google
</button>
