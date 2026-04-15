<script>
  import { setContext } from 'svelte'
  import { 
    tasksCache, 
    clickedTaskID, closeTaskPopup, familyTree, openTaskPopup,
    initialDataReady
  } from '$lib/store'
  import Task from '$lib/db/models/Task.js'
  import User from '$lib/db/models/User.js'
  import Template from '$lib/db/models/Template.js'
  import Icon from '$lib/db/models/Icon.js'
  import Message from '$lib/db/models/Message.js'
  import GCalAccount from '$lib/db/models/GCalAccount.js'
  import { trackWidth, trackHeight } from '$lib/utils/svelteActions.js'
  import { writable } from 'svelte/store'

  let { children } = $props()

  let dimensions = $state({
    width: 0,
    height: 0,
    appDiv: null
  })

  const treesByDate = writable({})

  $effect(() => {
    if (Object.keys($treesByDate).length > 0) {
      initialDataReady.set(true)
    }
  })

  setContext('dimensions', dimensions)

  setContext('app', {
    User, 
    Task, 
    Template,
    Icon,
    Message,
    GCalAccount,
    tasksCache,
    clickedTaskID,
    familyTree,
    openTaskPopup,
    closeTaskPopup,
    treesByDate,
    trees: writable(null),
    treesByID: writable({})
  })
</script>

<div bind:this={dimensions.appDiv} class="z-0 relative h-full"
  use:trackWidth={w => dimensions.width = w}
  use:trackHeight={h => dimensions.height = h}
>
  {@render children()}
</div>