<script>
  import { onMount } from 'svelte'
  import { user } from '$lib/store'
  import RecursiveMessage from './RecursiveMessage.svelte'
  import { formatChatTimestamp, randomAnonymousNickname } from '$lib/utils/communityChatDisplay.js'
  import { getRandomID } from '$lib/utils/core.js'
  import Message from '$lib/db/models/Message.js'
  import CommunityChatZenBirdAvatar from './CommunityChatZenBirdAvatar.svelte'
  import CommunityChatComposer from './CommunityChatComposer.svelte'
  import IcBaselineReply from 'virtual:icons/ic/baseline-reply'

  let {
    message,
    lineClamp = 2,
    class: className = '',
    ancestorIDs = []
  } = $props()

  let time = $derived(formatChatTimestamp(message.serverTimestamp))
  let childAncestorIDs = $derived([...ancestorIDs, message.id])

  let bodyEl = $state(/** @type {HTMLParagraphElement | null} */ (null))
  let expanded = $state(false)
  let isTruncated = $state(false)

  let replies = $state([])
  let replyPopover = $state(/** @type {HTMLElement | null} */ (null))
  let repliesOpen = $state(false)

  const popoverID = `replies-${getRandomID()}`
  const anchorName = `--anchor-${popoverID}`

  let participantUids = $derived([...new Set(replies.map(r => r.uid))].slice(-5))

  onMount(() => Message.listenByParent(message.id, newVals => replies = newVals))

  function updateTruncation () {
    if (!bodyEl) {
      isTruncated = false
      return
    }
    if (lineClamp <= 0 || expanded) {
      isTruncated = false
      return
    }
    isTruncated = bodyEl.scrollHeight > bodyEl.clientHeight
  }

  function onPopoverToggle (e) {
    repliesOpen = e.newState === 'open'
  }

  $effect(() => {
    void message.content
    void lineClamp
    void expanded
    void bodyEl

    if (!bodyEl) return
    updateTruncation()

    if (lineClamp <= 0 || expanded) return
    const ro = new ResizeObserver(() => updateTruncation())
    ro.observe(bodyEl)
    return () => ro.disconnect()
  })
</script>

<article class="flex w-full gap-3 p-3 text-left {className}">
  <CommunityChatZenBirdAvatar uid={message.uid} />

  <div class="min-w-0 flex-1 flex flex-col">
    <p
      bind:this={bodyEl}
      class="text-base my-0 break-words text-neutral-800"
      style={!expanded
        ? `white-space: pre-line; overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: ${lineClamp};`
        : 'white-space: pre-line;'}
    >
      {message.content}
    </p>

    <div class="flex items-center py-0 gap-x-2">
      {#if (isTruncated || expanded)}
        <button onclick={() => expanded = !expanded}
          class="border-0 bg-transparent p-0 text-sm font-medium text-neutral-600 underline decoration-neutral-400/80 underline-offset-2"
        >
          {expanded ? 'See less' : 'See more'}
        </button>
      {/if}

      <span class="text-sm font-semibold text-neutral-600">
        {message.nickname}
      </span>
      <time class="text-sm text-neutral-600">
        {time}
      </time>

      <button
        popovertarget={popoverID}
        popovertargetaction="toggle"
        style:anchor-name={anchorName}
        class="inline-flex items-center gap-x-3 rounded-md border-0 py-0 text-sm font-normal text-neutral-600 transition-colors"
      >
        {#if replies.length > 0}
          <div class="flex gap-x-1 items-center">
            <span class="flex shrink-0 -space-x-1.5 items-center">
              {#each participantUids as uid, i (uid)}
                <span class="relative inline-flex" style="z-index: {3 - i}">
                  <CommunityChatZenBirdAvatar
                    {uid}
                    size="sm"
                    class="ring-2 ring-neutral-100"
                  />
                </span>
              {/each}
            </span>
            {replies.length} 
            {replies.length === 1 ? 'reply' : 'replies'}
          </div>
        {/if}

        {#if replies.length === 0}
          <div class="flex gap-x-0.5 items-center text-neutral-600">
            <IcBaselineReply style="font-size: 0.875rem"/>
            <span class="text-sm">reply</span>
          </div>
        {/if}
      </button>
    </div>
  </div>
</article>

<div
  popover="auto"
  id={popoverID}
  bind:this={replyPopover}
  ontoggle={onPopoverToggle}
  class="absolute w-[min(420px,calc(100vw-16px))] max-h-[min(72dvh,calc(100vh-16px))] overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.12)]"
  style:position-anchor={anchorName}
  style:position-area="block-end span-inline-end"
  style:position-try-fallbacks="flip-block, flip-inline, flip-inline flip-block"
>
  <div class="flex flex-col max-h-[inherit]">
    <div class="min-h-0 flex-1 overflow-y-auto divide-y divide-neutral-100/90">
      {#each replies as reply (reply.id)}
        {#if !childAncestorIDs.includes(reply.id)}
          <RecursiveMessage
            message={reply}
            lineClamp={2}
            ancestorIDs={childAncestorIDs}
          />
        {/if}
      {/each}
    </div>

    <CommunityChatComposer
      parentID={message.id}
    />
  </div>
</div>
