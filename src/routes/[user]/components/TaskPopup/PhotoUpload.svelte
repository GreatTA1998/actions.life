<button onclick={async () => {
  const files = await selectImages()
  if (files[0]) imbuePhotoIntoTask(files[0], task.id, onUpload, onFinished)
}} class="flex">
  <MslAddPhotoAlternateOutline style="font-size: var(--popup-control);"/>
</button>

<script>
  import { uploadThenGetMetadata } from '$lib/utils/imageHandling.js'
  import MslAddPhotoAlternateOutline from 'virtual:icons/material-symbols-light/add-photo-alternate-outline'
  import { getFirestoreDoc } from '$lib/db/helpers.js'
  import { getContext } from 'svelte'
  import { user } from '$lib/store'
  import { selectImages } from '$lib/native/photos.js'

  const { Task } = getContext('app')
  let { onUpload, onFinished, task } = $props()

  async function imbuePhotoIntoTask (image, id, onUpload, onFinished) {
    onUpload()

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

    if ($user.photoUploadAutoArchive) {
      updateObj.isDone = true
      updateObj.duration = orientation === 'landscape' ? 106 : 188

      const task = await getFirestoreDoc(`/users/${$user.uid}/tasks/${id}`)

      if (!task.startDateISO) {
        updateObj.startDateISO = dt.toFormat('yyyy-MM-dd')
        updateObj.startTime = dt.toFormat('HH:mm')
      }
    }

    await Task.update({ id, kvChanges: updateObj })

    onFinished()
  }
</script>
