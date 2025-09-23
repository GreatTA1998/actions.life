<button class="circle-outline-button material-symbols-outlined"  
  {onclick}
>
  add_photo_alternate
</button>

<input style="display: none;" 
  bind:this={FolderInput}
  onchange={handleFileChange} 
  type="file" 
  accept="image/*" 
>

<script>
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

<style>
  .circle-outline-button {
    margin-left: 6px; 
    border-radius: 24px; 
    padding: 4px;
  }
</style>