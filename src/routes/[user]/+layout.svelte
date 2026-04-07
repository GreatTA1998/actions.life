<script>
  import { page } from '$app/state'
  import UserAppInstance from '$lib/components/UserAppInstance.svelte'
</script>

<div style:height="100dvh">
  <UserAppInstance uid={page.params.user}/>
</div>