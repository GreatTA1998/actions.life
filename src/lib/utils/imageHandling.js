import imageCompression from 'browser-image-compression'
import { getRandomID, getTimeInHHMM } from '$lib/utils/core.js'
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { DateTime } from 'luxon'
import Task from '$lib/db/models/Task.js'

const storage = getStorage()

export async function singleUpload ({ e, willCompress, task, hasSideEffect }) {
  const promises = []
  for (let image of e.target.files) { // in reality it's always one file due to the input limit
    if (image) { // blob file
      const id = getRandomID()
      if (willCompress) {
        image = await compressImage(image)
      }
      promises.push(
        uploadImageBlobToFirebase(image, id).then(resultSnapshot => {
          mergeImageWithTask(resultSnapshot, image, id, task, hasSideEffect)
        })
      )
    }
  }
  await Promise.all(promises)
}

async function mergeImageWithTask (resultSnapshot, imageBlobFile, id, task, hasSideEffect) {
  const { metadata } = resultSnapshot 
  const { fullPath, timeCreated } = metadata

  // STEP 0: parallel process to retrieve width & height
  let durationForFullDisplay
  const p1 = createImageBitmap(imageBlobFile).then(bitmap => {
    // TO-DO: settings
    // these durations will display fully the portrait / landscape iPhone photos on an iPad Air 1180x820
    // const { width, height } = bitmap 
    // if (width > height) durationForFullDisplay = 106
    // else durationForFullDisplay = 188
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
    // note we do NOT change the task's timing based on the photo
  }

  if (hasSideEffect) {
    if (!task.startDateISO) {
      updateObj.startDateISO = DateTime.fromJSDate(dateClassObj).toFormat('yyyy-MM-dd')
      updateObj.startTime = getTimeInHHMM({ dateClassObj })
    }
    updateObj.isDone = true
  }

  try {
    Task.update({ 
      id: task.id, 
      kvChanges: updateObj 
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

export async function compressImage (file) {
  const options = {
    maxSizeMB: 1,         
    maxWidthOrHeight: 1920, 
    useWebWorker: true,     // Use web worker for performance
    quality: 0.8,          // JPEG quality (0.1 - 1.0)
    preserveExif: false,   // Remove EXIF for smaller size
  }
  
  try {
    const compressedFile = await imageCompression(file, options)
    return compressedFile

  } catch (error) {
    console.error('Compression failed:', error)
    return file
  }
}