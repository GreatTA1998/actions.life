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
  import GCalAccount from '$lib/db/models/GCalAccount.js'
  import { singleUpload } from '$lib/utils/imageHandling.js'

  let { children } = $props()

  setContext('app', {
    User, 
    Task, 
    Template,
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

{@render children()}