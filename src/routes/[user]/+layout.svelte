<script>
  import { page } from '$app/state'
  import UserAppInstance from '$lib/components/UserAppInstance.svelte'
</script>

<UserAppInstance uid={page.params.user}/>