<script>
  import { onMount, onDestroy } from 'svelte'
  import { trees, listenToTasks, cleanup } from './service.js'
  import { page } from '$app/state'
  
  let { children } = $props()

  onMount(() => {
    listenToTasks(page.params.user)
  })

  onDestroy(() => {
    // cleanup()
  })
</script>

{@render children({ trees: $trees })}
