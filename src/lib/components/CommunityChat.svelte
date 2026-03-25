<script>
  import CommunityChatThreadPopup from './CommunityChatThreadPopup.svelte'
  import CommunityChatMessageRow from './CommunityChatMessageRow.svelte'
  import CommunityChatComposer from './CommunityChatComposer.svelte'
  import {
    randomAnonymousNickname,
    replyParticipantUidsForParent
  } from '$lib/utils/communityChatDisplay.js'
  
  const demoUid = 'proto-user'
  const demoNickname = 'You'

  /** @type {{ id: string, content: string, parentID: string | null, uid: string, nickname: string, serverTimestamp: number }[]} */
  let messages = $state([
    {
      id: 'm1',
      content: `[IMPORTANT] beta.actions.life has newer improvements, but it also has undergone less testing, so has higher risk of bugs.
        If you want less frequent updates and more predictability, use the stable version: actions.life. Next week's beta update: 
          - Typing and exiting the calendar input will save the task
          - Tapping on the calendar is also subject to calendar snapping
          - Tasks with sub-tasks can be made into a routine too
          - Xiaomi and Android devices in general will also have the original date and time of photos imprinted on tasks
      `,
      parentID: null,
      uid: 'sys',
      nickname: randomAnonymousNickname(),
      serverTimestamp: Date.now() - 3600000
    },
    {
      id: 'm2',
      content: 'Short note.',
      parentID: null,
      uid: 'u2',
      nickname: randomAnonymousNickname(),
      serverTimestamp: Date.now() - 1800000
    },
    {
      id: 'm3',
      content: 'First reply under the welcome post.',
      parentID: 'm1',
      uid: 'u3',
      nickname: randomAnonymousNickname(),
      serverTimestamp: Date.now() - 900000
    },
    {
      id: 'm4',
      content: 'Nested answer to Jordan.',
      parentID: 'm3',
      uid: demoUid,
      nickname: demoNickname,
      serverTimestamp: Date.now() - 600000
    }
  ])

  let openThreadId = $state(/** @type {string | null} */ (null))
  let threadAnchorEl = $state(/** @type {HTMLElement | null} */ (null))
  let rootDraft = $state('')

  let roots = $derived(messages.filter(m => m.parentID == null))

  function directReplyCount (parentId) {
    return messages.filter(m => m.parentID === parentId).length
  }

  function addMessage ({ parentID, content }) {
    messages = [
      ...messages,
      {
        id: crypto.randomUUID(),
        content,
        parentID,
        uid: demoUid,
        nickname: demoNickname,
        serverTimestamp: Date.now()
      }
    ]
  }

  function sendRoot () {
    const t = rootDraft.trim()
    if (!t) return
    addMessage({ parentID: null, content: t })
    rootDraft = ''
  }

  let openParent = $derived(
    openThreadId ? messages.find(m => m.id === openThreadId) : null
  )

  function closeThread () {
    openThreadId = null
    threadAnchorEl = null
  }
</script>

<div class="flex flex-col gap-3">
  <h2 class="text-lg font-semibold">Community Support</h2>

  <div
    class="overflow-hidden rounded-xl border border-neutral-200/90 bg-neutral-50/90 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
  >
    <div class="max-h-[min(280px,40vh)] divide-y divide-neutral-200/80 overflow-y-auto">
      {#each roots as m (m.id)}
        <CommunityChatMessageRow
          message={m}
          lineClamp={2}
          replyCount={directReplyCount(m.id)}
          replyParticipantUids={replyParticipantUidsForParent(messages, m.id)}
          onThreadClick={(e) => {
            if (openThreadId === m.id) closeThread()
            else {
              openThreadId = m.id
              threadAnchorEl = e.currentTarget
            }
          }}
        />
      {/each}
    </div>

    <CommunityChatComposer
      bind:value={rootDraft}
      onSend={sendRoot}
    />
  </div>
</div>

{#if openParent && threadAnchorEl}
  <CommunityChatThreadPopup
    anchorEl={threadAnchorEl}
    parentMessage={openParent}
    {messages}
    zIndex={50}
    onClose={closeThread}
    onAddMessage={payload => addMessage(payload)}
  />
{/if}
