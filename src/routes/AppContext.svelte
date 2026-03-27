<script>
  import { setContext } from 'svelte'
  import { 
    tasksCache, 
    clickedTaskID, closeTaskPopup, familyTree, openTaskPopup
  } from '$lib/store'
  import Task from '$lib/db/models/Task.js'
  import User from '$lib/db/models/User.js'
  import Template from '$lib/db/models/Template.js'
  import Icon from '$lib/db/models/Icon.js'
  import Message from '$lib/db/models/Message.js'
  import GCalAccount from '$lib/db/models/GCalAccount.js'

  let { children } = $props()

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
    closeTaskPopup
  })
</script>

<div class="z-0 relative">
  {@render children()}
</div>