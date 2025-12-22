<script>
  import { releaseImage } from '$lib/db/helpers.js'
  import Icon from '@iconify/svelte'
  import { getContext } from 'svelte'

  const { Task, user } = getContext('app')

  let { taskObject } = $props()

  async function confirmDeletePhoto ({ imageFullPath, imageDownloadURL }) {
    if (confirm('Are you sure you want to delete the photo?')) {
      if ($user.uid !== 'demo-user') {
        await releaseImage($user.uid, { imageFullPath, imageDownloadURL })
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

<button onclick={() => confirmDeletePhoto(taskObject)} 
  class="photo-row-action" 
>
  <Icon icon="material-symbols-light:no-photography-outline" style="font-size: 1.125rem;"/>
  <span class="photo-row-label">Remove photo</span>
</button>

<style>
  .photo-row-action {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    color: #333;
    font-size: 0.875rem;
    padding: 4px 8px;
    border-radius: 6px;
    transition: background 0.2s;
    width: 100%;
    justify-content: flex-start;
  }

  .photo-row-label {
    font-size: 0.875rem;
    font-weight: 400;
  }

  .photo-row-action:hover {
    background: rgba(0,0,0,0.05);
  }
</style>