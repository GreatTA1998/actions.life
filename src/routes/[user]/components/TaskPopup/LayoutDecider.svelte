<script>
  import { breakpoints, goldenRatio, WIDTHS } from '$lib/utils/constants.js'
  import { innerWidth } from 'svelte/reactivity/window'

  let { task, photo, info } = $props()

  const { PANEL_MAX } = WIDTHS
  let desktop = $derived(innerWidth.current >= breakpoints.desktop)
  let imgURL = $derived(task.imageDownloadURL)
  let aspectRatio = $state(0)

  $effect(async () => {
    if (imgURL) {
      aspectRatio = await getAspectRatio(imgURL)
    }
  })

  async function getAspectRatio (src) {
    const img = new Image()
    img.src = src
    await img.decode()
    return img.naturalWidth / img.naturalHeight
  }
</script>

{#if task.imageDownloadURL && aspectRatio}
  {#if task.photoLayout === 'full-photo'}
    {@render photo(`max-width: 100vw; max-height: ${!desktop ? '80dvh' : '100dvh'}`)}
  {:else}
    {#if !desktop}
      <div style="max-height: 80dvh; width: 100vw; max-width: {PANEL_MAX}px">
        {@render photo("width: 100%; height: 40dvh; object-fit: cover;")}
        <div class="w-full p-3">
          {@render info()}
        </div>
      </div>
    {:else}      
      {#if aspectRatio <= 1} <!-- left portrait -->
        {@const photoWidth = PANEL_MAX / goldenRatio}
        <div class="flex">
          {@render photo(`width: ${photoWidth}px; object-fit: cover;`)}

          <div class="overflow-y-auto hide-scrollbar py-3 px-4"
            style:width="{PANEL_MAX}px"
            style:max-height="{photoWidth * 1/aspectRatio}px"
          >
            {@render info()}
          </div>
        </div>  
      {:else if aspectRatio > 1} <!-- top landscape -->
        {@render photo(`width: ${PANEL_MAX}px; object-fit: cover;`)}
        <div style="width: {PANEL_MAX}px; padding: 12px;">
          {@render info()}
        </div>
      {/if}
    {/if}
  {/if}
{:else}
  {#if !desktop}
    <div style="max-height: 80dvh; width: 100vw; max-width: {PANEL_MAX}px; padding: 12px;">
      {@render info()}
    </div>
  {:else}
    <div style="width: {PANEL_MAX}px; padding: 12px;">
      {@render info()}
    </div>
  {/if}
{/if}