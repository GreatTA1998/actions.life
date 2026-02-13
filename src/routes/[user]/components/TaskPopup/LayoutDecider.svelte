<script>
  import { breakpoints, goldenRatio, WIDTHS } from '$lib/utils/constants.js'
  import { innerWidth } from 'svelte/reactivity/window'

  let { task, photo, info } = $props()

  const { PANEL_MAX } = WIDTHS
  const photoWidth = PANEL_MAX / goldenRatio
  let desktop = $derived(innerWidth.current >= breakpoints.desktop)
  let imageDownloadURL = $derived(task?.imageDownloadURL ?? '')
  let aspectRatio = $state(null)

  // Keep this memoized so realtime task updates do not retrigger async layout resets.
  const aspectRatioCache = new Map()
  const inFlightAspectRatioRequests = new Map()

  function readAspectRatio (src) {
    if (aspectRatioCache.has(src)) {
      return Promise.resolve(aspectRatioCache.get(src))
    }

    if (inFlightAspectRatioRequests.has(src)) {
      return inFlightAspectRatioRequests.get(src)
    }

    const request = (async () => {
      const img = new Image()
      img.src = src
      await img.decode()
      const ratio = img.naturalWidth / img.naturalHeight
      aspectRatioCache.set(src, ratio)
      return ratio
    })().finally(() => {
      inFlightAspectRatioRequests.delete(src)
    })

    inFlightAspectRatioRequests.set(src, request)
    return request
  }

  $effect(() => {
    const src = imageDownloadURL
    if (!src) {
      aspectRatio = null
      return
    }

    if (aspectRatioCache.has(src)) {
      aspectRatio = aspectRatioCache.get(src)
      return
    }

    aspectRatio = null
    let cancelled = false

    readAspectRatio(src)
      .then(ratio => {
        if (!cancelled && src === imageDownloadURL) {
          aspectRatio = ratio
        }
      })
      .catch(() => {
        if (!cancelled && src === imageDownloadURL) {
          aspectRatio = null
        }
      })

    return () => {
      cancelled = true
    }
  })
</script>

{#if task}
  {@const { imageDownloadURL, photoLayout } = task}

  {#if imageDownloadURL}
    {#if photoLayout === 'full-photo'}
      {@render photo(`max-width: 100vw; max-height: ${!desktop ? '80dvh' : '100dvh'}`)}
    {:else}
      {#if !desktop}
        <div style="max-height: 80dvh; width: 100vw; max-width: {PANEL_MAX}px">
          {@render photo("width: 100%; height: 40dvh; object-fit: cover;")}
          <div style="width: 100%; padding: 12px;">
            {@render info()}
          </div>
        </div>
      {:else}
        {#if aspectRatio !== null && aspectRatio > 1} <!-- top landscape -->
          {@render photo(`width: ${PANEL_MAX}px; object-fit: cover;`)}
          <div style="width: {PANEL_MAX}px; padding: 12px;">
            {@render info()}
          </div>
        {:else} <!-- left portrait (or fallback while loading) -->
          <div style="display: flex;">
            {@render photo(`width: ${photoWidth}px; object-fit: cover;`)}
            <div style="
              width: {PANEL_MAX}px;
              max-height: {aspectRatio !== null ? `${photoWidth * (1 / aspectRatio)}px` : '80dvh'}; 
              overflow-y: auto;
              padding: 12px 16px;"
              class="hide-scrollbar"
            >
              {@render info()}
            </div>
          </div>
        {/if}
      {/if}
    {/if}
  {:else}
    {#if innerWidth.current < breakpoints.desktop}
      <div style="max-height: 80dvh; width: 100vw; max-width: {PANEL_MAX}px; padding: 12px;">
        {@render info()}
      </div>
    {:else}
      <div style="width: {PANEL_MAX}px; padding: 12px;">
        {@render info()}
      </div>
    {/if}
  {/if}
{/if}