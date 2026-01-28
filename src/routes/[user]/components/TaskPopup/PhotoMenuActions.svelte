<script>
  import SharePhotoButton from '$lib/components/SharePhotoButton.svelte'
  import PhotoRemove from './PhotoRemove.svelte'
  import ToggleGroupStyled from '$lib/components/ToggleGroupStyled.svelte'
  import { getContext } from 'svelte'

  import MslSplitscreenLeft from 'virtual:icons/material-symbols-light/splitscreen-left'
  import MslSplitscreenTop from 'virtual:icons/material-symbols-light/splitscreen-top'
  import MslFullscreenPortrait from 'virtual:icons/material-symbols-light/fullscreen-portrait'

  const { Task } = getContext('app')

  let { task } = $props()

  function updateLayout(newVal) {
    Task.update({ id: task.id, keyValueChanges: { photoLayout: newVal }})
  }
</script> 

<div>
  <ToggleGroupStyled>
    <button onclick={() => updateLayout('side-by-side')} class="toggle-btn" class:active={task.photoLayout === 'side-by-side'}>
      <MslSplitscreenLeft style="font-size: 1.25rem;"/>
    </button>
    <button onclick={() => updateLayout('top-and-below')} class="toggle-btn" class:active={task.photoLayout === 'top-and-below'}>
      <MslSplitscreenTop style="font-size: 1.25rem;"/>
    </button>
    <button onclick={() => updateLayout('full-photo')} class="toggle-btn" class:active={task.photoLayout === 'full-photo'}>
      <MslFullscreenPortrait style="font-size: 1.25rem;"/>
    </button>
  </ToggleGroupStyled>

  <SharePhotoButton 
    {task}
  />
  
  <PhotoRemove {task} />
</div>