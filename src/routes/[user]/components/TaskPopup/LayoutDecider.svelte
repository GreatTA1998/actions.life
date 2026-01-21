<script>
  import { innerWidth } from 'svelte/reactivity/window'

  let { taskObject, photo, info } = $props()

  const breakpoints = {
    tablet: 768,
    desktop: 1024
  }
  const W = { total: breakpoints.desktop }
  const PHI = 1.618
  W.taskInfo = W.total / PHI

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
        {@render photo("width: 500px; height: 500px; object-fit: cover;")}
      {:else}
        {#if innerWidth.current < breakpoints.desktop}
          <div style="max-height: 80dvh; width: 100vw; max-width: {W.taskInfo}px">
            {@render photo("width: 100%; height: 40dvh; object-fit: cover;")}
            <div style="width: 100%; padding: 12px;">
              {@render info()}
            </div>
          </div>
        {:else}      
          {#if aspectRatio <= 1} <!-- left portrait -->
            {@const photoWidth = W.taskInfo / PHI}
            <div style="display: flex;">
          
              {@render photo(`width: ${photoWidth}px; object-fit: cover;`)}
              <div style="
                width: {W.taskInfo}px;
                max-height: {photoWidth * 1/aspectRatio}px; 
                overflow-y: auto;
                padding: 12px 16px;"
                class="hide-scrollbar"
              >
                {@render info()}
              </div>
            </div>  
          {:else if aspectRatio > 1} <!-- top landscape -->
            {@render photo(`width: ${W.taskInfo}px; object-fit: cover;`)}
            <div style="width: {W.taskInfo}px; padding: 12px;">
              {@render info()}
            </div>
          {/if}
        {/if}
      {/if}
    {/await}
  {:else}
    {#if innerWidth.current < breakpoints.desktop}
      <div style="max-height: 80dvh; width: 100vw; max-width: {W.taskInfo}px; padding: 12px;">
        {@render info()}
      </div>
    {:else}
      <div style="width: {W.taskInfo}px; padding: 12px;">
        {@render info()}
      </div>
    {/if}
  {/if}
{/if}