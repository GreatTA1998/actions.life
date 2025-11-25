<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { trees, listenToTasks, cleanup } from './service.js'

  const { user } = getContext('app')
  
  let { children } = $props()

  onMount(() => {
    listenToTasks($user.uid)
  })

  onDestroy(() => {
    // cleanup()
  })
</script>

{@render children({ trees: $trees })}
