<script>
  import ClaudeTimePicker from '$lib/Reusable/ClaudeTimePicker.svelte'
  import { user, calEarliestHHMM, calLastHHMM } from '/src/store'
  import { updateFirestoreDoc } from '/src/helpers/firebase.js'

  $: userPath = '/users/' + $user.uid
</script>

<div style="display: flex; column-gap: 4px; align-items: center;">    
  <ClaudeTimePicker value={$calEarliestHHMM} on:change={e => updateFirestoreDoc(userPath, { calEarliestHHMM: e.detail.value })}/>
  to
  <ClaudeTimePicker value={$calLastHHMM} on:change={e => updateFirestoreDoc(userPath, { calLastHHMM: e.detail.value })}/>
</div>