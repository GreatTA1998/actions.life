<script>
  import ExportLists from './ExportLists.svelte'
  import ExportCalendar from './ExportCalendar.svelte'
  import DateRangeSlider from '$lib/components/DateRangeSlider.svelte'
  import { DateTime } from 'luxon'

  let { onFinish } = $props()

  let previewMD = $state('')
  let tokenEstimate = $state(0)
  let startDate = $state(DateTime.now().minus({ months: 12 }).toISODate())
  let endDate = $state(DateTime.now().toISODate())

  const PREVIEW_LIMIT = 1500
  const CLIPBOARD_TOKEN_LIMIT = 15000

  function onExport (md) {
    previewMD = md
    tokenEstimate = Math.ceil(md.length / 4)
    
    if (tokenEstimate < CLIPBOARD_TOKEN_LIMIT) copy(md)
    else download(md)
  }

  function copy (data) {
    navigator.clipboard.writeText(data)
    onFinish('Copied to clipboard')
  }

  function download (data) {
    const blob = new Blob([data], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `export-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
    onFinish('Downloaded')
  }
</script>

<div style="display: flex; flex-direction: column; gap: 16px;">
  <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
    <ExportLists {onExport} />

    <ExportCalendar {onExport} {startDate} {endDate} />
    
    <div style="flex: 1;">
      <DateRangeSlider bind:startDate bind:endDate />
    </div>
  </div>

  {#if previewMD}
    <div style="display: flex; flex-direction: column; gap: 8px;"> 
      <pre>{previewMD.slice(0, PREVIEW_LIMIT)}
<!-- pre gets affected by code formatting -->
<span style="font-style: italic;">~{tokenEstimate.toLocaleString()} tokens</span>{#if previewMD.length > PREVIEW_LIMIT} <span class="truncated">... ({(previewMD.length - PREVIEW_LIMIT).toLocaleString()} more chars)</span>{/if}
      </pre>
    </div>
  {/if}
</div>

<style>
  pre {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 8px;
    font-size: 0.75rem;
    max-height: 200px;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
