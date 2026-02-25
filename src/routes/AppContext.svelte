<script>
  import { setContext } from 'svelte'
  import { 
    user,
    tasksCache, 
    clickedTaskID, closeTaskPopup, familyTree, openTaskPopup
  } from '$lib/store'
  import Task from '$lib/db/models/Task.js'
  import User from '$lib/db/models/User.js'
  import Template from '$lib/db/models/Template.js'
  import Icon from '$lib/db/models/Icon.js'
  import GCalAccount from '$lib/db/models/GCalAccount.js'
  import { singleUpload } from '$lib/utils/imageHandling.js'

  let { children } = $props()

  setContext('app', {
    User, 
    Task, 
    Template,
    Icon,
    GCalAccount,
    tasksCache,
    clickedTaskID,
    familyTree,
    openTaskPopup,
    closeTaskPopup,
    uploadImage
  })

  async function uploadImage ({ e, task }) {
    await singleUpload({ 
      e,
      task,
      willCompress: $user.photoCompressWhenAttachingToTask,
      hasSideEffect: $user.photoUploadAutoArchive
    })
  }
</script>

<div class="z-0 relative">
  {@render children()}
</div>