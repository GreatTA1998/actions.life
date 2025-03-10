<!-- `align-items: center` is a quickfix related to mystery height, probably from the invisible input -->
<div style="display: flex; align-items: center;">
  <span on:click={openFolderInput} class="material-symbols-outlined responsive-icon-size">
    photo_library
  </span>

  <input style="display: none;" 
    bind:this={FolderInput}
    on:change={(e) =>  handleFileChange(e)} 
    multiple
    type="file" 
    accept="image/*" 
  >
</div>

<script>
  import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
  import { getRandomID, getTimeInHHMM } from '/src/helpers/everythingElse.js'
  import { user } from '/src/store'
  import { onMount } from 'svelte'
  import { DateTime } from 'luxon'
  import { createTaskNode } from '/src/helpers/crud.js'

  const storage = getStorage()

  let FolderInput

  onMount(() => {

  })

  function openFolderInput () {
    FolderInput.click()
  }

  async function handleFileChange (e) {
    const promises = []
    for (const imageBlobFile of e.target.files) {
      if (imageBlobFile) {
        const id = getRandomID()
        promises.push(
          uploadImageBlobToFirebase(imageBlobFile, id).then(resultSnapshot => {
            createNewScheduledTaskContainingImage(resultSnapshot, imageBlobFile, id)
          })
        )
      }
    }
    await Promise.all(promises)
    alert('Photos successfully uploaded.')
  }

  async function uploadImageBlobToFirebase (blobFile, id) {
    return new Promise(async (resolve) => {
      const storageRef = ref(storage, `images/${id}`)
      const snapshot = await uploadBytes(storageRef, blobFile)
      resolve(snapshot)
    })
  }

  async function createNewScheduledTaskContainingImage (resultSnapshot, imageBlobFile, id) {

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
    
    await Promise.all([p1, p2]).catch(err => console.error('error in creNewSchedueledTasksContainingImage PromiseAll', err));

    // STEP 2: create a task scheduled at the same time the photo is taken
    let dateClassObj 
    if (imageBlobFile.lastModified) dateClassObj = new Date(imageBlobFile.lastModified)
    else dateClassObj = new Date(timeCreated) // otherwise we set the time to right now.

    const newTaskObj = {
      name: `Photo ${getTimeInHHMM({ dateClassObj })}`,
      imageDownloadURL,
      imageFullPath: fullPath, // for easy garbage collection
      startTime: getTimeInHHMM({ dateClassObj }),
      startDateISO: DateTime.fromJSDate(dateClassObj).toFormat('yyyy-MM-dd'),
      duration: durationForFullDisplay,
      isDone: true // so the image isn't blurred
    }

    // Use the proper API to create the task
    await createTaskNode({ id, newTaskObj });
  }
</script>

<style>
  .responsive-icon-size {
    font-size: 34px;
    /* clamp(1rem, 4vw, 1.5rem);   */
    /* font-size: 24px;  */
    cursor: pointer; 
    color: black;
    font-weight: 300;
    /* rgb(120, 120, 120); */
  }
</style>