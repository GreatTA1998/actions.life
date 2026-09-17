<div>
  <button type="button" aria-label="Add photos" onclick={() => forgeTasksFromPhotos()}
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
</div>

<script>
  import MslPhotoLibrary from 'virtual:icons/material-symbols-light/photo-library'
  import { uploadThenGetMetadata } from '$lib/utils/imageHandling.js'
  import { getContext } from 'svelte'
  import { user, snackbarState } from '$lib/store'
  import { selectImages } from '$lib/native/photos.js'

  const { Task } = getContext('app')

  let { style } = $props()

  async function forgeTasksFromPhotos () {
    const files = await selectImages({ multiple: true })
    if (!files.length) return

    snackbarState.set({ isVisible: true, message: 'Uploading...', undoAction: null })

    await Promise.all(files.map(image =>
      uploadThenGetMetadata(image, $user.photoCompressWhenAttachingToTask)
        .then(({ dt, orientation, imageFullPath, imageDownloadURL }) => {
          Task.create({ data: {
            imageDownloadURL,
            imageFullPath,
            isDone: true,
            startDateISO: dt.toFormat('yyyy-MM-dd'),
            startTime: dt.toFormat('HH:mm'),
            duration: orientation === 'landscape' ? 106 : 188,
            onList: false,
            photoLayout: $user.defaultPhotoLayout
          }})
        })
    ))

    snackbarState.set({ isVisible: false, message: '', undoAction: null })
  }
</script>
