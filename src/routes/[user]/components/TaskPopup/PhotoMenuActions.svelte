<script>
  import { photoLayoutOptions } from '$lib/store/photoLayout.js'
  import SharePhotoButton from '$lib/components/SharePhotoButton.svelte'
  import PhotoRemove from './PhotoRemove.svelte'
  import ToggleGroup from '$lib/components/ToggleGroup.svelte'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')

  let { taskObject } = $props()
</script> 

<div>
  <ToggleGroup 
    options={photoLayoutOptions} useIcons
    activeValue={taskObject.photoLayout} 
    onselect={newVal => Task.update({ id: taskObject.id, keyValueChanges: { photoLayout: newVal }})}
  >
  </ToggleGroup>

  <SharePhotoButton 
    imageURL={taskObject.imageDownloadURL}
    date={taskObject.startDateISO}
    notes={taskObject.notes}
  />
  
  <PhotoRemove {taskObject} />
</div>