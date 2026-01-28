<script>
  import PopoverSnackbar from '$lib/components/PopoverSnackbar.svelte'
  import PhotoUpload from './PhotoUpload.svelte'
  import { getContext } from 'svelte'

  const { Task } = getContext('app')

  let { task } = $props()
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
          close({ timeout: 10000 });
          setLoading(false);
        }}
      />
    {/if}
  {/snippet}

  {#snippet customActions({ open, close, setLoading })}
    <div style="color: white; display: flex; justify-content: space-between; align-items: center; gap: 16px;">
      How was it? 
      <div style="display: flex; align-items: center; column-gap: 12px;">
        {#each [': (', ': |', ': )'] as emotion}
          <button onclick={() => {
            Task.update({ id: task.id, keyValueChanges: { notes: emotion + ' ' + task.notes }});
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