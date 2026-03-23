import imageCompression from 'browser-image-compression'
import { getStorage, uploadBytes, getDownloadURL, ref } from 'firebase/storage'
import { randomID } from '$lib/utils/core.js'
import exifr from 'exifr'
import { DateTime } from 'luxon'

export async function uploadThenGetMetadata (image, compress) {
  const [dt, orientation, [imageFullPath, imageDownloadURL]] = await Promise.all([
    exifr.parse(image).then(
      exif => exif?.DateTimeOriginal ? 
        DateTime.fromJSDate(exif.DateTimeOriginal) : DateTime.fromMillis(image.lastModified)
    ),
    createImageBitmap(image).then(({ width, height }) => width > height ? 'landscape' : 'portrait'),
    uploadToStorage(image, compress)
  ])
  return { dt, orientation, imageFullPath, imageDownloadURL }
}

export async function uploadToStorage (image, compress) {
  if (compress) image = await compressImage(image)  

  const storage = getStorage()
  const { metadata } = await uploadBytes(ref(storage, `images/${randomID()}`), image)
  const imageDownloadURL = await getDownloadURL(ref(storage, metadata.fullPath))
  return [metadata.fullPath, imageDownloadURL]
}

export async function compressImage (file) {
  const options = {
    maxSizeMB: 1,         
    maxWidthOrHeight: 1920, 
    useWebWorker: true,     // Use web worker for performance
    quality: 0.8,          // JPEG quality (0.1 - 1.0)
    preserveExif: true, 
  }

  return imageCompression(file, options)
}