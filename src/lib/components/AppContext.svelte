<script>
  import Task from '$lib/db/models/Task.js'
  import User from '$lib/db/models/User.js'
  import Template from '$lib/db/models/Template.js'
  import Icon from '$lib/db/models/Icon.js'
  import Message from '$lib/db/models/Message.js'
  import GCalAccount from '$lib/db/models/GCalAccount.js'
  import { setContext, onMount } from 'svelte'
  import { user, initialDataReady } from '$lib/store'
  import { trackWidth, trackHeight } from '$lib/utils/svelteActions.js'
  import { writable } from 'svelte/store'
  import { collection, onSnapshot} from 'firebase/firestore'
  import { db } from '$lib/db/init.js'

  let { children } = $props()

  let dimensions = $state({
    width: 0,
    height: 0,
    appDiv: null
  })

  const treesByDate = writable({})
  const templates = writable([])

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

    treesByDate,
    trees: writable(null),
    treesByID: writable({}),

    templates
  })

  onMount(() => onSnapshot(
    collection(db, `users/${$user.uid}/templates`),
    snap => templates.set(snap.docs.map(d => ({ ...d.data(), id: d.id })))
  ))
</script>

<div 
  bind:this={dimensions.appDiv} 
  use:trackWidth={w => dimensions.width = w}
  use:trackHeight={h => dimensions.height = h}
  class="z-0 relative h-full"
>
  {@render children()}
</div>