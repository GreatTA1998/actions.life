<script>
  import { releaseImage } from '$lib/db/helpers.js'
  import MslNoPhotographyOutline from 'virtual:icons/material-symbols-light/no-photography-outline'
  import { getContext } from 'svelte'
  import { user } from '$lib/store'

  const { Task } = getContext('app')

  let { task } = $props()

  async function confirmDeletePhoto ({ imageFullPath, imageDownloadURL }) {
    if (confirm('Are you sure you want to delete the photo?')) {
      if ($user.uid !== 'demo-user') {
        await releaseImage($user.uid, { imageFullPath, imageDownloadURL })
      }
      Task.update({ 
        id: task.id,
        keyValueChanges: { 
          imageDownloadURL: '',
          imageFullPath: ''
        }
      })
    }
  }
</script>

<button onclick={() => confirmDeletePhoto(task)} 
  class="photo-row-action" 
>
  <MslNoPhotographyOutline style="font-size: 1.125rem;"/>
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