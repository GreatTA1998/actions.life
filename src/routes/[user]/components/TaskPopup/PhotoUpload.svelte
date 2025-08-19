<button class="circle-outline-button material-symbols-outlined"  
  on:click={() => FolderInput.click()} 
>
  add_photo_alternate
</button>

<input style="display: none;" 
  bind:this={FolderInput}
  on:change={(e) => handleFileChange(e)} 
  type="file" 
  accept="image/*" 
>

<script>
  import { compressImage } from '$lib/utils/photoCompress.js'
  import { getRandomID, getTimeInHHMM } from '$lib/utils/core.js'
  import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
  import { DateTime } from 'luxon'
  import { getContext } from 'svelte'

  const { Task, user } = getContext('app')

  export let onUpload
  export let onFinished
  export let taskObject
  
  let FolderInput
  const storage = getStorage()

  async function handleFileChange (e) {
    onUpload()
    const promises = []
    for (let image of e.target.files) { // in reality it's always one file due to the input limit
      if (image) { // blob file
        const id = getRandomID()
        if ($user.photoCompressWhenAttachingToTask) {
          image = await compressImage(image)
        }
        promises.push(
          uploadImageBlobToFirebase(image, id).then(resultSnapshot => {
            mergeImageWithTask(resultSnapshot, image, id)
          })
        )
      }
    }
    await Promise.all(promises)
    onFinished()
  }

  async function mergeImageWithTask (resultSnapshot, imageBlobFile, id) {
    const { metadata } = resultSnapshot 
    const { fullPath, timeCreated } = metadata

    // STEP 0: parallel process to retrieve width & height
    let durationForFullDisplay
    const p1 = createImageBitmap(imageBlobFile).then(bitmap => {
      const { width, height } = bitmap 
      // these durations will display fully the portrait / landscape iPhone photos on an iPad Air 1180x820
      if (width > height) durationForFullDisplay = 106
      else durationForFullDisplay = 188
    })

    // STEP 1: getDownloadURL()
    let imageDownloadURL 
    const p2 = getDownloadURL(ref(storage, fullPath)).then(url => imageDownloadURL = url)
    
    await Promise.all([p1, p2])

    // STEP 2: create a task scheduled at the same time the photo is taken
    let dateClassObj 
    if (imageBlobFile.lastModified) dateClassObj = new Date(imageBlobFile.lastModified)
    else dateClassObj = new Date(timeCreated) // otherwise we set the time to right now.

    const updateObj = {
      imageDownloadURL,
      imageFullPath: fullPath, // for easy garbage collection
      isDone: true
      // note we do NOT change the task's timing based on the photo
    }

    // only auto-hydrate the time if the task isn't already on the calendar
    if (!taskObject.startDateISO) { 
      updateObj.startDateISO = DateTime.fromJSDate(dateClassObj).toFormat('yyyy-MM-dd')
      updateObj.startTime = getTimeInHHMM({ dateClassObj })
      updateObj.duration = durationForFullDisplay
    }

    // user settings: automations 
    if ($user.photoUploadAutoArchive) {
      updateObj.isArchived = true
    }

    try {
      Task.update({ 
        id: taskObject.id, 
        keyValueChanges: updateObj 
      })
    } catch (error) {
      console.error(error)
      alert("Error uploading photo, please reload")
    }
  }

  async function uploadImageBlobToFirebase (blobFile, id) {
    return new Promise(async (resolve) => {
      const storageRef = ref(storage, `images/${id}`)
      const snapshot = await uploadBytes(storageRef, blobFile)
      resolve(snapshot)
    })
  }
</script>

<style>
  .circle-outline-button {
    cursor: pointer; 
    margin-left: 6px; 
    border-radius: 24px; 
    padding: 4px;
  }
</style>