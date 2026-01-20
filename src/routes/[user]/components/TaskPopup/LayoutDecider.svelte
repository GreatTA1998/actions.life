<script>
  import { innerWidth } from 'svelte/reactivity/window'

  let { taskObject, photo, taskInfo } = $props()

  const W = { details1: 480, details2: 480}
  const PHI = 1.618

  async function getAspectRatio (src) {
    const img = new Image()
    img.src = src
    await img.decode()
    return img.naturalWidth / img.naturalHeight
  }
</script>

{#if taskObject}
  {@const { imageDownloadURL, photoLayout } = taskObject}

  {#if imageDownloadURL}
    {#await getAspectRatio(imageDownloadURL) then aspectRatio}
      {#if photoLayout === 'full-photo'}
        {@render photo("width: 400px; height: 400px; object-fit: cover;")}
      {:else}
        {#if innerWidth.current < 768}
          <div style="max-height: 80dvh; width: 100vw;">
            {@render photo("width: 100%; height: 40dvh; object-fit: cover;")}
            <div style="width: 100%; padding: 12px;">
              {@render taskInfo()}
            </div>
          </div>
        {:else}      
          {#if aspectRatio <= 1} <!-- left portrait -->
            <div style="display: flex;">
              {@render photo("width: {W.details2 / PHI}px; height: 400px; object-fit: cover;")}
              <div style="width: {W.details2}px; padding: 12px 16px;">
                {@render taskInfo()}
              </div>
            </div>  
          {:else if aspectRatio > 1} <!-- top landscape -->
            {@render photo("width: {W.details1}px; height: {W.details1 * 3/4}px; object-fit: cover;")}
            <div style="width: {W.details1}px; height: 300px; padding: 12px;">
              {@render taskInfo()}
            </div>
          {/if}
        {/if}
      {/if}
    {/await}
  {:else}
    {#if innerWidth.current < 768}
      <div style="max-height: 80dvh; width: 100vw; padding: 12px;">
        {@render taskInfo()}
      </div>
    {:else}
      <div style="width: 768px; height: 480px; border: solid red; padding: 12px;">
        {@render taskInfo()}
      </div>
    {/if}
  {/if}
{/if}