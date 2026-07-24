<script>
  import CheckboxSquare from '$lib/components/CheckboxSquare.svelte'
  import { user } from '$lib/store'
  import { getContext } from 'svelte'

  const { User } = getContext('app')

  function toggle (fieldName) {
    User.update({ [fieldName]: !$user[fieldName] })
  }
</script>

<div class="flex flex-col gap-y-3">  
  <CheckboxSquare onClick={() => toggle('photoUploadAutoArchive')}
    value={$user.photoUploadAutoArchive}
    label="Auto-schedule task based on photo's date"
  />

  <CheckboxSquare onClick={() => toggle('photoCompressWhenAttachingToTask')}
    value={$user.photoCompressWhenAttachingToTask}
    label="Use modern compression"
  />
</div>