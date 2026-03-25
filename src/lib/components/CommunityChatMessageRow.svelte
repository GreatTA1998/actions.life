<script>
  import { formatChatTimestamp } from '$lib/utils/communityChatDisplay.js'
  import CommunityChatZenBirdAvatar from './CommunityChatZenBirdAvatar.svelte'
  import MsForumOutline from 'virtual:icons/material-symbols-light/forum-outline'
  import MsReply from 'virtual:icons/material-symbols/reply'

  let {
    message,
    onThreadClick = () => {},
    replyCount = 0,
    replyParticipantUids = [],
    lineClamp = 0,
    class: className = ''
  } = $props()

  let time = $derived(formatChatTimestamp(message.serverTimestamp))

  let bodyEl = $state(/** @type {HTMLParagraphElement | null} */ (null))
  let expanded = $state(false)
  /** True when line-clamp is hiding overflow (measured after layout). */
  let isTruncated = $state(false)
  /** Prevents showing thread action before first truncation measurement. */
  let truncationMeasured = $state(false)

  function updateTruncation () {
    if (!bodyEl) {
      truncationMeasured = false
      isTruncated = false
      return
    }

    if (lineClamp <= 0 || expanded) {
      truncationMeasured = true
      isTruncated = false
      return
    }

    // StackOverflow approach: full content height vs rendered (clamped) height.
    isTruncated = bodyEl.scrollHeight > bodyEl.clientHeight
    truncationMeasured = true
  }

  $effect(() => {
    void message.content
    void lineClamp
    void expanded
    void bodyEl

    if (!bodyEl) {
      return
    }

    updateTruncation()

    if (lineClamp <= 0 || expanded) return

    const ro = new ResizeObserver(() => updateTruncation())
    ro.observe(bodyEl)

    return () => {
      ro.disconnect()
    }
  })
</script>

<article class="flex w-full gap-3 p-3 text-left {className}">
  <CommunityChatZenBirdAvatar uid={message.uid} />

  <div class="min-w-0 flex-1 flex flex-col gap-y-1">
    <div class="flex flex-wrap items-baseline gap-x-2">
      <span class="text-base font-semibold text-neutral-700">
        {message.nickname}
      </span>
      <time
        class="text-sm text-zinc-600"
        datetime={new Date(message.serverTimestamp).toISOString()}
      >{time}</time>
    </div>

    <p
      bind:this={bodyEl}
      class="text-base my-0 break-words text-neutral-800"
      style={lineClamp > 0 && !expanded
        ? `white-space: pre-line; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: ${lineClamp};`
        : 'white-space: pre-line;'}
    >
      {message.content}
    </p>

    <div class="flex items-center py-1 gap-x-2">
      {#if lineClamp > 0 && (isTruncated || expanded)}
        <button onclick={() => expanded = !expanded}
          class="border-0 bg-transparent p-0 text-sm font-medium text-neutral-600 underline decoration-neutral-400/80 underline-offset-2"
        >
          {expanded ? 'See less' : 'See more'}
        </button>
      {/if}

      {#if onThreadClick && (lineClamp <= 0 || expanded || (truncationMeasured && !isTruncated))}
        <button
          onclick={(e) => {
            e.stopPropagation()
            onThreadClick?.(e)
          }}
          class="inline-flex cursor-pointer items-center gap-1 rounded-md border-0 px-1.5 py-0.5 
            text-sm font-medium text-neutral-600 transition-colors"
        >
          {#if replyCount > 0}
            {#if replyParticipantUids.length > 0}
              <span class="flex shrink-0 -space-x-1.5 items-center">
                {#each replyParticipantUids.slice(0, 3) as uid, i (uid)}
                  <span class="relative inline-flex" style="z-index: {3 - i}">
                    <CommunityChatZenBirdAvatar
                      {uid}
                      size="sm"
                      class="ring-2 ring-neutral-100"
                    />
                  </span>
                {/each}
              </span>
            {:else}
              <MsForumOutline style="font-size: 0.875rem; opacity: 0.8;" />
            {/if}
            {replyCount}
            {replyCount === 1 ? 'reply' : 'replies'}
          {:else}
            <div class="flex items-center gap-x-1">
              <MsReply style="font-size: 1rem; opacity: 0.85;" />
              <span class="text-sm">Reply</span>
            </div>
          {/if}
        </button>
      {/if}
    </div>
  </div>
</article>
