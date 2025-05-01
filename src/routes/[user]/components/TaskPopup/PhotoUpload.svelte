{#if !taskObject.imageDownloadURL}
  <span class="circle-outline-button material-symbols-outlined"  
    on:click={() => FolderInput.click()} 
  >
    add_photo_alternate
  </span>

  <input style="display: none;" 
    bind:this={FolderInput}
    on:change={(e) => handleFileChange(e)} 
    type="file" 
    accept="image/*" 
  >
{:else}
  <span class="circle-outline-button material-symbols-outlined" 
    on:click={() => confirmDeletePhoto(taskObject.imageFullPath)}
  >
    no_photography
  </span>
{/if}

<script>
  import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
  import { getRandomID, getTimeInHHMM } from '/src/lib/utils/core.js'
  import { DateTime } from 'luxon'
  import { deleteImage } from '/src/lib/db/helpers.js'
  import Task from '/src/lib/db/models/Task.js'

  export let taskObject

  let FolderInput
  const storage = getStorage()

  async function handleFileChange (e) {
    const promises = []
    for (const imageBlobFile of e.target.files) {
      if (imageBlobFile) {
        const id = getRandomID()
        promises.push(
          uploadImageBlobToFirebase(imageBlobFile, id).then(resultSnapshot => {
            mergeImageWithTask(resultSnapshot, imageBlobFile, id)
          })
        )
      }
    }
    await Promise.all(promises)
    alert('Photos successfully uploaded.')
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

  function confirmDeletePhoto (imageFullPath) {
    if (confirm('Are you sure you want to delete the photo?')) {
      deleteImage({ imageFullPath })

      Task.update({ 
        id: taskObject.id,
        keyValueChanges: {
          imageDownloadURL: '',
          imageFullPath: ''
        }
      })
    }
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