<script>
  import { releaseImage } from '$lib/db/helpers.js'
  import MslDeleteOutline from 'virtual:icons/material-symbols-light/delete-outline'
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
        kvChanges: { 
          imageDownloadURL: '',
          imageFullPath: ''
        }
      })
    }
  }
</script>

<button onclick={() => confirmDeletePhoto(task)} class="justify-start py-2 px-3 ">
  <MslDeleteOutline style="font-size: 1.5rem"/>
</button>