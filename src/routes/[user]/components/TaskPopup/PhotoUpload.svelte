<button {onclick} class="flexbox">
  <MslAddPhotoAlternateOutline style="font-size: var(--popup-control);"/>
</button>

<input style="display: none;" 
  bind:this={FolderInput}
  onchange={handleFileChange} 
  type="file" 
  accept="image/*" 
>

<script>
  import MslAddPhotoAlternateOutline from 'virtual:icons/material-symbols-light/add-photo-alternate-outline'
  import { getContext } from 'svelte'

  const { uploadMockPhoto, uploadImage, user } = getContext('app')
  let { onUpload, onFinished, taskObject } = $props()
  let FolderInput = $state(null)

  function onclick () {
    if ($user.uid === 'demo-user') uploadMockPhoto(taskObject)
    else FolderInput.click()
  }
 
  async function handleFileChange (e) {
    onUpload()
    await uploadImage({ e, taskObject })
    onFinished()
  }
</script>