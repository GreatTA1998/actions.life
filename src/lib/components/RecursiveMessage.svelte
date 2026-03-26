<script>
  import { onMount } from 'svelte'
  import RecursiveMessage from './RecursiveMessage.svelte'
  import { formatChatTimestamp } from '$lib/utils/communityChatDisplay.js'
  import Message from '$lib/db/models/Message.js'
  import CommunityChatZenBirdAvatar from './CommunityChatZenBirdAvatar.svelte'
  import CommunityChatComposer from './CommunityChatComposer.svelte'
  import IcBaselineReply from 'virtual:icons/ic/baseline-reply'
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'

  let {
    message,
    class: className = '',
    ancestorIDs = [],
    depth = 0
  } = $props()

  const lineClamp = 2
  let time = $derived(formatChatTimestamp(message.serverTimestamp))
  let childAncestorIDs = $derived([...ancestorIDs, message.id])

  let bodyEl = $state(/** @type {HTMLParagraphElement | null} */ (null))
  let expanded = $state(false)
  let isTruncated = $state(false)
  let replies = $state([])
  let participantUids = $derived([...new Set(replies.map(r => r.uid))].slice(-5))

  onMount(() => Message.listenByParent(message.id, newVals => replies = newVals))

  function updateTruncation () {
    if (!bodyEl || !lineClamp || expanded) {
      isTruncated = false
      return
    }
    isTruncated = bodyEl.scrollHeight > bodyEl.clientHeight // if in the future this fails for Safari, use `+1`
  }

  $effect(() => {
    void message.content
    void lineClamp
    void expanded
    void bodyEl

    if (!bodyEl) return
    updateTruncation()

    if (!lineClamp || expanded) return
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
          class="shrink-1 text-nowrap truncate p-0 text-sm font-medium text-neutral-600 underline decoration-neutral-400/80 underline-offset-2"
        >
          {expanded ? 'see less' : 'see more'}
        </button>
      {/if}

      <!-- COMMENTED OUT TEMPORARILY AS IT TAKES UP TOO MUCH MOBILE SCREEN WIDTH
      <span class="text-sm font-semibold text-neutral-600">
        {message.nickname}
      </span> -->
      <time class="shrink-1 text-sm text-neutral-600 text-nowrap truncate">
        {time}
      </time>

      <PopoverMenu>
        {#snippet activator ({ id, anchorName })}
          <button 
            popovertarget={id}
            style:anchor-name={anchorName}
            class="ml-auto shrink-0 gap-x-3 rounded-md border-0 py-0 text-sm font-normal text-neutral-600 transition-colors"
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

                <span class="text-nowrap truncate">
                  {replies.length} 
                  {replies.length === 1 ? 'reply' : 'replies'}
                </span>
              </div>
            {/if}

            {#if replies.length === 0}
              <div class="flex gap-x-0.5 items-center text-neutral-600">
                <IcBaselineReply style="font-size: 0.875rem"/>
                <span class="text-sm">reply</span>
              </div>
            {/if}
          </button>
        {/snippet}

        {#snippet content ()}
          <div class="flex flex-col" style="width: {300 - (depth * 60)}px;">
            <div class="min-h-0 flex-1 overflow-y-auto divide-y divide-neutral-100/90">
              {#each replies as reply (reply.id)}
                {#if !childAncestorIDs.includes(reply.id)}
                  <RecursiveMessage
                    message={reply}
                    ancestorIDs={childAncestorIDs}
                    depth={depth+1}
                  />
                {/if}
              {/each}
            </div>
        
            <CommunityChatComposer
              parentID={message.id}
            />
          </div>
        {/snippet}
      </PopoverMenu>
    </div>
  </div>
</article>
