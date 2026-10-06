<script>
  import { getContext } from 'svelte'

  const { registerDropzone, bestDropzoneID, dropPreviewCSS } = getContext('drag-drop')

  let {
    tasks = [],
    slotID,
    onReorder,
    clipRectFunction = () => ({ left: -Infinity, top: -Infinity, right: Infinity, bottom: Infinity }),
    row,
    after
  } = $props()
</script>

<!--
  One zone per task, covering that row: drop here to insert before it.
  The bottom half of the last row is the only extra zone, and it inserts after the list.
-->
<div class="flex w-full flex-col">
  {#each tasks as task, i (task.id)}
    {@const last = i === tasks.length - 1}
    <div class="flex w-full flex-col">
      <div class="relative w-full">
        <div
          {@attach registerDropzone({
            id: slotID(i),
            clipRectFunction,
            onDrop: () => onReorder(i)
          })}
          class="pointer-events-none absolute top-0 z-10 {last ? 'h-1/2' : 'bottom-0'}"
          style:left="var(--left-padding)"
          style:right="var(--left-padding)"
        >
          {#if $bestDropzoneID === slotID(i)}
            <div class="h-1 -translate-y-1/2" style:border-radius="var(--left-padding)" style={dropPreviewCSS}></div>
          {/if}
        </div>

        {#if last}
          <div
            {@attach registerDropzone({
              id: slotID(i + 1),
              clipRectFunction,
              onDrop: () => onReorder(i + 1)
            })}
            class="pointer-events-none absolute top-1/2 z-10 h-1/2"
            style:left="var(--left-padding)"
            style:right="var(--left-padding)"
          >
            {#if $bestDropzoneID === slotID(i + 1)}
              <div class="absolute inset-x-0 bottom-0 h-1 translate-y-1/2" style:border-radius="var(--left-padding)" style={dropPreviewCSS}></div>
            {/if}
          </div>
        {/if}

        <div class="px-[var(--left-padding)]">
          {@render row(task)}
        </div>
      </div>

      {#if after}
        {@render after(task)}
      {/if}
    </div>
  {/each}
</div>
