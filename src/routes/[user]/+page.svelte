<script>
  import MainPage from '$lib/MainPage/MainPage.svelte'
  import { handleInitialTasks } from '$lib/MainPage/handleTasks'
  import { page } from '$app/stores'
  import { onMount } from 'svelte'

  $: userID = $page.params.user

  // fetch everything needed in parallel
  onMount(() => {
    handleInitialTasks(userID)
  })
</script>

<MainPage />