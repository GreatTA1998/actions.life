<script>
  import { deleteImage } from '$lib/db/helpers.js'
  import { getContext } from 'svelte'

  const { Task, user } = getContext('app')

  let { taskObject } = $props()

  function confirmDeletePhoto (imageFullPath) {
    if (confirm('Are you sure you want to delete the photo?')) {
      if ($user.uid !== 'demo-user') {
        deleteImage({ imageFullPath })
      }
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

<button onclick={() => confirmDeletePhoto(taskObject.imageFullPath)} 
  class="photo-row-action" 
>
  <span class="material-symbols-outlined">no_photography</span>
  <span class="photo-row-label">Remove photo</span>
</button>

<style>
  .photo-row-action {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: #333;
    font-size: 14px;
    padding: 4px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.2s;
    font-weight: 400;
    width: 100%;
    justify-content: flex-start;
    box-sizing: border-box;
  }

  .photo-row-action .material-symbols-outlined {
    font-size: 18px;
  }

  .photo-row-label {
    font-size: 14px;
    font-weight: 400;
  }

  .photo-row-action:hover {
    background: rgba(0,0,0,0.05);
  }
</style>