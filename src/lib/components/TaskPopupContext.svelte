<script>
  import TaskPopup from '/src/routes/[user]/components/TaskPopup/TaskPopup.svelte'
  import ListenToDoc from '$lib/components/ListenToDoc.svelte'
  import ListenToTaskTree from '$lib/components/ListenToTaskTree.svelte'
  import { setContext } from 'svelte'
  import { user } from '$lib/store'
  import { writable } from 'svelte/store'

  let { children } = $props()

  const ancestralTree = writable(null)

  let context = $state({
    ancestralTree,
    openTaskPopup: (task) => {
      id = task.id
      rootID = task.rootID
    },
    closeTaskPopup: () => rootID = '',
  })

  let id = $state('')
  let rootID = $state('')

  setContext('task-popup', context)
</script>

{@render children()}

{#if rootID}
  <ListenToTaskTree {rootID} {id}>
    <ListenToDoc docPath="/users/{$user.uid}/tasks/{id}">
      {#snippet children (task)}
        <!-- ensure both task and ancestralTree are ready.
          listenToDoc is blocking while listenToTaskTree isn't  -->
        {#if $ancestralTree}
          <TaskPopup {task} />
        {/if}
      {/snippet}
    </ListenToDoc>
  </ListenToTaskTree>
{/if}