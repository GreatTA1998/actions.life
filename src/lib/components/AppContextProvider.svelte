<script>
  import { setContext } from 'svelte'
  import { 
    user,
    tasksCache, 
    clickedTaskID, closeTaskPopup, ancestralTree, openTaskPopup, willOpenDatePicker,
  } from '$lib/store'
  import Task from '$lib/db/models/Task.js'
  import User from '$lib/db/models/User.js'
  import Template from '$lib/db/models/Template.js'
  import { singleUpload } from '$lib/utils/imageHandling.js'

  let { children } = $props()

  async function uploadImage ({ e, taskObject }) {
    await singleUpload({ 
      e,
      taskObject,
      willCompress: $user.photoCompressWhenAttachingToTask,
      willArchive: $user.photoUploadAutoArchive,
    })
  }

  setContext('app', {
    User, user,
    Task, 
    Template,
    tasksCache,
    clickedTaskID,
    ancestralTree,
    openTaskPopup,
    closeTaskPopup,
    uploadImage,
    willOpenDatePicker
  })
</script>

{@render children()}