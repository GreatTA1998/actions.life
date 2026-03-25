<script>
  import { tick } from 'svelte'
  import CommunityChatThreadPopup from './CommunityChatThreadPopup.svelte'
  import CommunityChatMessageRow from './CommunityChatMessageRow.svelte'
  import CommunityChatComposer from './CommunityChatComposer.svelte'
  import { replyParticipantUidsForParent } from '$lib/utils/communityChatDisplay.js'

  let {
    anchorEl,
    parentMessage,
    messages,
    zIndex = 20,
    onClose,
    onAddMessage
  } = $props()

  let draft = $state('')
  let nestedParentId = $state(/** @type {string | null} */ (null))
  let nestedAnchorEl = $state(/** @type {HTMLElement | null} */ (null))
  let panelEl = $state(/** @type {HTMLElement | null} */ (null))

  let replies = $derived(
    messages.filter(m => m.parentID === parentMessage.id)
  )

  function send () {
    const t = draft.trim()
    if (!t) return
    onAddMessage({ parentID: parentMessage.id, content: t })
    draft = ''
  }

  let nestedParent = $derived(
    nestedParentId ? messages.find(m => m.id === nestedParentId) : null
  )

  function replyCountFor (id) {
    return messages.filter(m => m.parentID === id).length
  }

  function updatePosition () {
    if (!anchorEl || !panelEl) return
    const rect = anchorEl.getBoundingClientRect()
    const margin = 8
    const vw = globalThis.innerWidth
    const vh = globalThis.innerHeight

    let top = rect.bottom + margin
    let left = rect.left

    const pw = panelEl.offsetWidth
    const ph = panelEl.offsetHeight

    if (top + ph > vh - margin) {
      top = Math.max(margin, rect.top - ph - margin)
    }
    if (left + pw > vw - margin) {
      left = vw - pw - margin
    }
    if (left < margin) left = margin
    if (top < margin) top = margin

    panelEl.style.top = `${top}px`
    panelEl.style.left = `${left}px`
  }

  $effect(() => {
    if (!anchorEl || !panelEl) return

    const schedule = () => {
      tick().then(() => {
        requestAnimationFrame(updatePosition)
      })
    }

    schedule()

    const ro = new ResizeObserver(schedule)
    ro.observe(panelEl)

    globalThis.addEventListener('resize', updatePosition)
    globalThis.addEventListener('scroll', updatePosition, true)

    const onPointerDown = (e) => {
      const t = /** @type {Node | null} */ (e.target)
      if (panelEl?.contains(t)) return
      if (anchorEl?.contains(t)) return
      onClose()
    }
    document.addEventListener('pointerdown', onPointerDown, true)

    return () => {
      ro.disconnect()
      globalThis.removeEventListener('resize', updatePosition)
      globalThis.removeEventListener('scroll', updatePosition, true)
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
  })
</script>

<div
  bind:this={panelEl}
  class="fixed w-[min(400px,calc(100vw-16px))] overflow-hidden rounded-xl border border-neutral-200/90 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.12)]"
  style="z-index: {zIndex};"
  role="dialog"
  aria-label="Thread"
>
  <div class="flex max-h-[min(72dvh,calc(100vh-16px))] flex-col">

    <div class="min-h-0 flex-1 overflow-y-auto">
      <div class="divide-y divide-neutral-100/90">
        {#each replies as r (r.id)}
          <CommunityChatMessageRow
            message={r}
            lineClamp={2}
            replyCount={replyCountFor(r.id)}
            replyParticipantUids={replyParticipantUidsForParent(messages, r.id)}
            onThreadClick={(e) => {
              if (nestedParentId === r.id) {
                nestedParentId = null
                nestedAnchorEl = null
              } else {
                nestedParentId = r.id
                nestedAnchorEl = e.currentTarget
              }
            }}
          />
        {/each}
      </div>
    </div>

    <CommunityChatComposer
      bind:value={draft}
      onSend={send}
      sendLabel="Send reply"
      as="footer"
    />
  </div>

  {#if nestedParent && nestedAnchorEl}
    <CommunityChatThreadPopup
      anchorEl={nestedAnchorEl}
      parentMessage={nestedParent}
      {messages}
      zIndex={zIndex + 1}
      onClose={() => {
        nestedParentId = null
        nestedAnchorEl = null
      }}
      {onAddMessage}
    />
  {/if}
</div>
