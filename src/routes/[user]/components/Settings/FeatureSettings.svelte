<script>
  import CheckboxSquare from '$lib/components/CheckboxSquare.svelte'
  import { user } from '$lib/store'
  import { getContext } from 'svelte'

  const { User } = getContext('app')

  function toggle (fieldName) {
    User.update({ [fieldName]: $user[fieldName] === false })
  }
</script>

<div class="flex flex-col gap-y-3">
  <CheckboxSquare onClick={() => toggle('scheduleEnabled')}
    value={$user.scheduleEnabled !== false}
    label="Schedule"
  />

  <CheckboxSquare onClick={() => toggle('repeatEnabled')}
    value={$user.repeatEnabled !== false}
    label="Repeat"
  />

  <CheckboxSquare onClick={() => toggle('photoEnabled')}
    value={$user.photoEnabled !== false}
    label="Photo"
  />
</div>
