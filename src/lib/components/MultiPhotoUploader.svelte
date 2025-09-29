<div class="float-button" {style}>
  <!-- `align-items: center` is a quickfix related to mystery height, probably from the invisible input -->
  <div style="display: flex; align-items: center;">
    <button on:click={openFolderInput} class="material-symbols-outlined responsive-icon-size">
      photo_library
    </button>

    <input style="display: none;" 
      bind:this={FolderInput}
      on:change={(e) =>  handleFileChange(e)} 
      multiple
      type="file" 
      accept="image/*" 
    >
  </div>
</div>  

<script>
  import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
  import { getRandomID, getTimeInHHMM } from '/src/lib/utils/core.js'
  import { DateTime } from 'luxon'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')

  export let style

  const storage = getStorage()

  let FolderInput

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
      isDone: true, // so the image isn't blurred,
      persistsOnList: false 
      // TO-DO: use $user.defaultPhotoLayout
    }

    // Use the proper API to create the task
    await Task.create({ id, newTaskObj });
  }
</script>

<style>
  .float-button {
    position: absolute; 
    right: 1vw; 
    bottom: 1vw; 
    z-index: 1; 
    border: 1px solid var(--faint-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); 
    height: 50px;
    width: 50px;
    border-radius: 30px;  
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: hsl(98, 40%, 92%, 0.4);
  }

  .responsive-icon-size {
    font-size: 34px;
    color: black;
    font-weight: 300;
  }
</style>