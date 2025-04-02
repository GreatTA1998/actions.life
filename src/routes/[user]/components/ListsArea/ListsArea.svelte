<script>
  import { listenToTasks, trees } from './service.js'
  import { user } from '/src/lib/store'
  import { onMount } from 'svelte'
  import TodoList from './TodoList.svelte'

  onMount(() => {
    listenToTasks($user.uid)
  })
</script>

{#if $trees}
  <TodoList
    treesToDisplay={$trees}
    willShowCheckbox={true}
  />
{/if}