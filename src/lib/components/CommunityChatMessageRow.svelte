<script>
  import { formatChatTimestamp } from '$lib/utils/communityChatDisplay.js'
  import CommunityChatZenBirdAvatar from './CommunityChatZenBirdAvatar.svelte'
  import MsForumOutline from 'virtual:icons/material-symbols-light/forum-outline'
  import MsReply from 'virtual:icons/material-symbols-light/reply'

  let {
    message,
    onThreadClick = undefined,
    replyCount = 0,
    class: className = ''
  } = $props()

  let time = $derived(formatChatTimestamp(message.serverTimestamp))
</script>

<article
  class="flex w-full gap-3 p-3 text-left font-inherit {className}"
  role="article"
>
  <CommunityChatZenBirdAvatar uid={message.uid} />

  <div class="min-w-0 flex-1">
    <div class="flex flex-wrap items-baseline gap-x-2 gap-y-0">
      <span class="text-sm font-semibold text-neutral-800">{message.nickname}</span>
      <time
        class="text-xs font-medium text-neutral-400 tabular-nums"
        datetime={new Date(message.serverTimestamp).toISOString()}
      >{time}</time>
    </div>

    <p class="my-0 text-smsf">{message.content}</p>

    {#if onThreadClick}
      <button
        class="mt-1.5 inline-flex cursor-pointer items-center gap-1 rounded-md border-0 bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-600 font-inherit transition-colors hover:bg-neutral-200/90"
        aria-label={replyCount > 0
          ? `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}`
          : 'Reply'}
        onclick={(e) => {
          e.stopPropagation()
          onThreadClick?.(e)
        }}
      >
        {#if replyCount > 0}
          <MsForumOutline style="font-size: 0.875rem; opacity: 0.8;" />
          {replyCount}
          {replyCount === 1 ? 'reply' : 'replies'}
        {:else}
          <MsReply style="font-size: 1rem; opacity: 0.85;" aria-hidden="true" />
        {/if}
      </button>
    {/if}
  </div>
</article>
