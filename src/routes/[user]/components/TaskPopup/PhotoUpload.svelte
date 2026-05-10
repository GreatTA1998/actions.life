<button onclick={() => FolderInput.click()} class="flex">
  <MslAddPhotoAlternateOutline style="font-size: var(--popup-control);"/>
</button>

<input style:display="none"
  bind:this={FolderInput}
  onchange={e => imbuePhotoIntoTask(e, task.id, onUpload, onFinished)} 
  type="file" 
  accept="image/*" 
>

<script>
  import { uploadThenGetMetadata } from '$lib/utils/imageHandling.js'
  import MslAddPhotoAlternateOutline from 'virtual:icons/material-symbols-light/add-photo-alternate-outline'
  import { getContext } from 'svelte'
  import { updateCache, user } from '$lib/store'

  const { Task, tasksCache } = getContext('app')
  let { onUpload, onFinished, task } = $props()

  let FolderInput
 
  async function imbuePhotoIntoTask (e, id, onUpload, onFinished) {
    onUpload()
    const taskAtUpload = $tasksCache[id] ?? task

    let image = e.target.files[0]

    const { 
      dt, 
      orientation, 
      imageFullPath, 
      imageDownloadURL 
    } = await uploadThenGetMetadata(image, $user.photoCompressWhenAttachingToTask)

    const updateObj = { 
      imageDownloadURL, 
      imageFullPath 
    }

    const currentTask = $tasksCache[id] ?? taskAtUpload
    if (!$tasksCache[id] && currentTask?.id === id) updateCache([currentTask])

    if ($user.photoUploadAutoArchive) {
      updateObj.isDone = true
      updateObj.duration = orientation === 'landscape' ? 106 : 188

      if (currentTask && !currentTask.startDateISO) {
        updateObj.startDateISO = dt.toFormat('yyyy-MM-dd')
        updateObj.startTime = dt.toFormat('HH:mm')
      }
    }

    await Task.update({ id, kvChanges: updateObj })

    onFinished()
  }
</script>