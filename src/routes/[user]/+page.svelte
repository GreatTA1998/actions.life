<script>
  import MainPage from '$lib/MainPage/MainPage.svelte'
  import { handleInitialTasks } from '$lib/MainPage/handleTasks'
  import { page } from '$app/stores'
  import { onMount } from 'svelte'

  // fetch everything needed in parallel
  onMount(() => {
    handleInitialTasks($page.params.user)
  })
</script>

<MainPage />