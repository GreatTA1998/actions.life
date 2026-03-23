<div>
  <button onclick={() => FolderInput.click()}
    class={[
      'flex items-center z-1', 
      'size-[50px] rounded-[30px] bg-[hsla(98,40%,92%,0.4)]'
    ]}
    style:border="1px solid var(--faint-color)"
    style:box-shadow="0 2px 8px rgba(0, 0, 0, 0.15)"
    {style}
  >
    <MslPhotoLibrary style="font-size: 2.125rem"/>
  </button>

  <input style:display="none"
    bind:this={FolderInput}
    onchange={e => handleFileChange(e)} 
    multiple
    type="file" 
    accept="image/*" 
  >
</div>

<script>
  import exifr from 'exifr'
  import MslPhotoLibrary from 'virtual:icons/material-symbols-light/photo-library'
  import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'
  import { randomID } from '$lib/utils/core.js'
  import { compressImage } from '$lib/utils/imageHandling.js'
  import { DateTime } from 'luxon'
  import { getContext } from 'svelte'
  import { user, snackbarState } from '$lib/store'

  const { Task } = getContext('app')

  let { style } = $props()

  let FolderInput
  const storage = getStorage()

  async function handleFileChange (e) {
    snackbarState.set({ isVisible: true, message: 'Uploading...', undoAction: null })

    const promises = []
    for (let imageBlobFile of e.target.files) {
      const id = randomID()
      if ($user.photoCompressWhenAttachingToTask) {
        imageBlobFile = await compressImage(imageBlobFile)
      }
      promises.push(
        uploadBytes(ref(storage, `images/${id}`), imageBlobFile)
          .then(result => forgeTask(imageBlobFile, result.metadata.fullPath, id))
      )
    }
    await Promise.all(promises)

    snackbarState.set({ isVisible: false, message: '', undoAction: null })
  }

  async function forgeTask (imageBlobFile, imageFullPath, id) {
    const [durationForFullPhoto, imageDownloadURL, jsDateOriginal] = await Promise.all([
      createImageBitmap(imageBlobFile).then(({ width, height }) => width > height ? 106 : 188),
      getDownloadURL(ref(storage, imageFullPath)),
      exifr.parse(imageBlobFile).then(exif => exif.DateTimeOriginal)
    ])
    
    const dt = jsDateOriginal ? DateTime.fromJSDate(jsDateOriginal) : DateTime.fromMillis(imageBlobFile.lastModified)

    await Task.create({ id, data: {
      name: '',
      imageDownloadURL,
      imageFullPath, // for easy garbage collection
      startTime: dt.toFormat('HH:mm'),
      startDateISO: dt.toFormat('yyyy-MM-dd'),
      duration: durationForFullPhoto,
      isDone: true, // so the image has full opacity
      onList: false,
      photoLayout: $user.defaultPhotoLayout
    }})
  }
</script>