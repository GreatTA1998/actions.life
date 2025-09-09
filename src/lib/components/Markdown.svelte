<script>
  import { marked } from 'marked'

  let { content = '' } = $props()

  marked.setOptions({ breaks: true })
  const render = (md) => marked.parse(md || '')
</script>

<div class="markdown">{@html render(content)}</div>

<style>
  .markdown {
    white-space: normal;
    line-height: 1.4;
  }
  /* svelte-ignore css_unused_selector */
  .markdown p { margin: 0 0 8px; }
  /* svelte-ignore css_unused_selector */
  .markdown p:last-child { margin-bottom: 0; }
  /* svelte-ignore css_unused_selector */
  .markdown ul,
  /* svelte-ignore css_unused_selector */
  .markdown ol { margin: 0 0 6px 0.6em; padding-left: 0.6em; }
  /* svelte-ignore css_unused_selector */
  .markdown ul ul,
  /* svelte-ignore css_unused_selector */
  .markdown ul ol,
  /* svelte-ignore css_unused_selector */
  .markdown ol ul,
  /* svelte-ignore css_unused_selector */
  .markdown ol ol { margin-left: 0.2em; padding-left: 0.4em; }
  /* svelte-ignore css_unused_selector */
  .markdown li { margin: 0.1em 0; }
</style>


