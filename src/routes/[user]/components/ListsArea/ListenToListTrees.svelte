<script>
  import { onMount, onDestroy } from 'svelte'
  import { trees, listenToTasks, cleanup } from './service.js'
  import { user } from '$lib/store'
  
  let { children } = $props()

  onMount(() => {
    listenToTasks($user.uid)
  })

  onDestroy(() => {
    // cleanup()
  })
</script>

{@render children({ trees: $trees })}
