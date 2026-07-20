<script>
  import { breakpoints, goldenRatio, WIDTHS } from '$lib/utils/constants.js'
  import { innerWidth } from 'svelte/reactivity/window'

  let { task, photo, info } = $props()

  const { PANEL_MAX } = WIDTHS
  let desktop = $derived(innerWidth.current >= breakpoints.desktop)
  let styles = $state({ container: '', photo: '', detail: '' })

  $effect(() => {
    computeStyles(task.imageDownloadURL, desktop, task.photoLayout)
  })

  async function computeStyles (imageDownloadURL) {
    const next = { container: '', photo: '', detail: '' }
    if (imageDownloadURL) {
      const aspectRatio = await getAspectRatio(imageDownloadURL)
      if (task.photoLayout === 'full-photo') {
        next.photo = `max-width: 100vw; max-height: ${!desktop ? '80dvh' : '90vh'}`
        next.detail = 'display: none;'
      }
      else if (desktop) {
        if (aspectRatio <= 1) { // portrait
          const photoWidth = PANEL_MAX / goldenRatio
          next.container = 'display: flex; overflow-y: auto; max-height: 90vh'
          next.photo = `width: ${photoWidth}px; object-fit: cover;`
          next.detail = `width: ${PANEL_MAX}px; max-height: ${photoWidth * 1/aspectRatio}px`
        } else {
          next.photo = `width: ${PANEL_MAX}px`
        }
      }
      else {
        if (aspectRatio <= 1) { // portrait
          next.container = `display: flex; max-height: 80dvh; width: 100vw;`
          next.photo = 'max-width: 55vw' // hints horizontal scrolling
        } else {
          next.container = `max-height: 80dvh; width: 100vw; max-width: ${PANEL_MAX}px`
          next.photo = 'width: 100%'
        }
      }
    }
    else {
      if (desktop) next.detail = `width: ${PANEL_MAX}px;`
      else next.detail = `max-height: 80dvh; width: 100vw; max-width: ${PANEL_MAX}px; padding: 12px;`
    }

    styles = next
  }

  async function getAspectRatio (src) {
    const img = new Image()
    img.src = src
    await img.decode()
    return img.naturalWidth / img.naturalHeight
  }
</script>

<div style={styles.container}>
  {#if task.imageDownloadURL && styles.photo}
    {@render photo(styles.photo)}
  {/if}

  {@render info(styles.detail)}
</div>