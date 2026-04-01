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
    onchange={e => forgeTasksFromPhotos(e)} 
    multiple
    type="file" 
    accept="image/*" 
  >
</div>

<script>
  import MslPhotoLibrary from 'virtual:icons/material-symbols-light/photo-library'
  import { uploadThenGetMetadata } from '$lib/utils/imageHandling.js'
  import { getContext } from 'svelte'
  import { user, snackbarState } from '$lib/store'

  const { Task } = getContext('app')

  let { style } = $props()

  let FolderInput

  async function forgeTasksFromPhotos (e) {
    snackbarState.set({ isVisible: true, message: 'Uploading...', undoAction: null })

    await Promise.all([...e.target.files].map(image =>
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