<script>
  import ClaudeTimePicker from '$lib/components/ClaudeTimePicker.svelte'
  import { user, calEarliestHHMM, calLastHHMM } from '/src/lib/store'
  import { updateFirestoreDoc } from '/src/lib/db/helpers.js'

  $: userPath = '/users/' + $user.uid
</script>

<div class="time-range-container">    
  <ClaudeTimePicker 
    value={$calEarliestHHMM} 
    on:change={e => updateFirestoreDoc(userPath, { calEarliestHHMM: e.detail.value })}
  />
  <div class="time-separator">to</div>
  <ClaudeTimePicker 
    value={$calLastHHMM}
    on:change={e => updateFirestoreDoc(userPath, { calLastHHMM: e.detail.value })}
  />
</div>

<style>
  .time-range-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .time-separator {
    font-size: 13px;
    color: #555;
    margin: 0 4px;
  }

  :global(.time-range-container :global(.claude-time-picker)) {
    border: 1px solid #eaeaea;
    border-radius: 6px;
    background: white;
    color: #333;
    font-size: 13px;
    padding: 6px 10px;
    transition: all 0.2s ease;
  }

  :global(.time-range-container :global(.claude-time-picker:hover)) {
    border-color: #c0c0c0;
  }

  :global(.time-range-container :global(.claude-time-picker:focus-within)) {
    border-color: #6b6b6b;
    box-shadow: 0 0 0 1px rgba(107, 107, 107, 0.2);
  }
</style>