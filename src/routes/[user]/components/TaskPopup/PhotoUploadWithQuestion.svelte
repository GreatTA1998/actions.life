<script>
  import PopoverSnackbar from '$lib/components/PopoverSnackbar.svelte'
  import PhotoUpload from './PhotoUpload.svelte'
  import User from '$lib/db/models/User'
  import { user } from '$lib/store'
  import { randomID, getRandomColor } from '$lib/utils/core.js'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')

  let { task } = $props()

  function applyMood (emotion) {
    const existing = Object.entries($user.tags || {}).find(([, t]) => t.name === emotion)
    const id = existing?.[0] ?? randomID()
    if (!existing) {
      User.update({ tags: { ...$user.tags, [id]: { color: getRandomColor(), name: emotion } } })
    }
    if (!task.tagIDs?.includes(id)) {
      Task.update({ id: task.id, kvChanges: { tagIDs: [...(task.tagIDs || []), id] } })
    }
  }
</script>

<PopoverSnackbar>
  {#snippet activator({ open, close, setLoading })}
    {#if !task.imageDownloadURL}
      <PhotoUpload {task} 
        onUpload={() => {
          open();
          setLoading(true);
        }} 
        onFinished={() => {
          close({ timeout: 5000 });
          setLoading(false);
        }}
      />
    {/if}
  {/snippet}

  {#snippet customActions({ open, close, setLoading })}
    <div style="color: white; display: flex; justify-content: space-between; align-items: center; gap: 16px;">
      How was it? 
      <div style="display: flex; align-items: center; column-gap: 12px;">
        {#each [': )', ': |', ': ('] as emotion (emotion)}
          <button onclick={() => {
            applyMood(emotion);
            close({ timeout: 0 });
          }}
          style="width: 32px; height: 32px; outline: 1px solid white; align-items: center; justify-content: center; border-radius: 50%; transform: rotate(90deg)"
          >
            {emotion}
          </button>
        {/each}
      </div>  
    </div>
  {/snippet}
</PopoverSnackbar>