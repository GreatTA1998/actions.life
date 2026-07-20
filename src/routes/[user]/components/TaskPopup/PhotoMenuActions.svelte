<script>
  import SharePhotoButton from '$lib/components/SharePhotoButton.svelte'
  import PhotoRemove from './PhotoRemove.svelte'
  import { getContext } from 'svelte'
  import MslFullscreen from 'virtual:icons/material-symbols-light/fullscreen'
  import MslFullscreenExit from 'virtual:icons/material-symbols-light/fullscreen-exit'

  const { Task } = getContext('app')

  let { task } = $props()

  function updateLayout (newVal) {
    Task.update({ id: task.id, kvChanges: { photoLayout: newVal }})
  }
</script> 

<div class="flex" style:width="fit-content">
  {#if task.photoLayout !== 'full-photo'} 
    <button onclick={() => updateLayout('full-photo')} 
      class="justify-start py-2 px-3 gap-x-1 text-[#333]"
    >
      <MslFullscreen style="font-size: 1.5rem;"/>
    </button>
  {:else}
    <button onclick={() => updateLayout('split')}
      class="justify-start py-1 px-2 gap-x-1 text-[#333]"
    >
      <MslFullscreenExit style="font-size: 1.5rem;"/>
    </button>
  {/if}

  <SharePhotoButton {task} />

  <PhotoRemove {task} />
</div>