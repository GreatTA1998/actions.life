<script>
  import { breakpoints, goldenRatio, WIDTHS } from '$lib/utils/constants.js'
  import { innerWidth } from 'svelte/reactivity/window'

  let { task, photo, info } = $props()

  const panel = WIDTHS.PANEL_MAX

  async function getAspectRatio (src) {
    const img = new Image()
    img.src = src
    await img.decode()
    return img.naturalWidth / img.naturalHeight
  }
</script>

{#if task}
  {@const { imageDownloadURL, photoLayout } = task}

  {#if imageDownloadURL}
    {#await getAspectRatio(imageDownloadURL) then aspectRatio}
      {#if photoLayout === 'full-photo'}
        {@render photo("width: 500px; height: 500px; object-fit: cover;")}
      {:else}
        {#if innerWidth.current < breakpoints.desktop}
          <div style="max-height: 80dvh; width: 100vw; max-width: {panel}px">
            {@render photo("width: 100%; height: 40dvh; object-fit: cover;")}
            <div style="width: 100%; padding: 12px;">
              {@render info()}
            </div>
          </div>
        {:else}      
          {#if aspectRatio <= 1} <!-- left portrait -->
            {@const photoWidth = panel / goldenRatio}
            <div style="display: flex;">
          
              {@render photo(`width: ${photoWidth}px; object-fit: cover;`)}
              <div style="
                width: {panel}px;
                max-height: {photoWidth * 1/aspectRatio}px; 
                overflow-y: auto;
                padding: 12px 16px;"
                class="hide-scrollbar"
              >
                {@render info()}
              </div>
            </div>  
          {:else if aspectRatio > 1} <!-- top landscape -->
            {@render photo(`width: ${panel}px; object-fit: cover;`)}
            <div style="width: {panel}px; padding: 12px;">
              {@render info()}
            </div>
          {/if}
        {/if}
      {/if}
    {/await}
  {:else}
    {#if innerWidth.current < breakpoints.desktop}
      <div style="max-height: 80dvh; width: 100vw; max-width: {panel}px; padding: 12px;">
        {@render info()}
      </div>
    {:else}
      <div style="width: {panel}px; padding: 12px;">
        {@render info()}
      </div>
    {/if}
  {/if}
{/if}