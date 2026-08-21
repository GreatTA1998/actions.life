<script>
  import MsCall from 'virtual:icons/material-symbols/call'
  import MsMail from 'virtual:icons/material-symbols/mail'
  import PopoverMenu from '$lib/components/PopoverMenu.svelte'
  import OutboundLinks from './OutboundLinks.svelte'
  import { DateTime } from 'luxon'
  import { createSubscriber } from 'svelte/reactivity'

  const ZONE = 'Asia/Tokyo'
  const CALL_FROM = 9
  const CALL_UNTIL = 17

  const subscribe = createSubscriber((update) => {
    const id = setInterval(update, 1_000)
    return () => clearInterval(id)
  })

  const now = $derived.by(() => {
    subscribe()
    return DateTime.now().setZone(ZONE)
  })

  const canCall = $derived(
    now.weekday >= 1 && now.weekday <= 5
    && now.hour >= CALL_FROM && now.hour < CALL_UNTIL
  )

  const tokyoTime = $derived(now.toFormat('h:mm a'))
  const callHours = `${DateTime.fromObject({ hour: CALL_FROM }).toFormat('h a').toLowerCase()} – ${DateTime.fromObject({ hour: CALL_UNTIL }).toFormat('h a').toLowerCase()}`

  const iconBtn = 'grid size-10 shrink-0 place-items-center text-gray-700 no-underline transition-colors hover:text-gray-950'
  const legal = 'text-[13px] leading-none tracking-[-0.015em] text-gray-500 no-underline transition-colors hover:text-gray-800'
</script>

<footer class="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-black/[0.06] pt-8 pb-10">
  <OutboundLinks />

  <div class="flex flex-wrap items-center justify-end gap-x-6 gap-y-3">
    <div class="flex items-center">
      <PopoverMenu>
        {#snippet activator ({ id, anchorName })}
          <button
            popovertarget={id}
            style:anchor-name={anchorName}
            class={iconBtn}
          >
            <MsMail class="block size-7" />
          </button>
        {/snippet}

        {#snippet content ()}
          <div class="px-3 py-2.5 text-sm text-gray-600">
            <a
              href="mailto:elton@actions.life"
              class="no-underline transition-colors hover:text-gray-800"
            >
              elton@actions.life
            </a>
          </div>
        {/snippet}
      </PopoverMenu>

      <PopoverMenu>
        {#snippet activator ({ id, anchorName })}
          <button
            popovertarget={id}
            style:anchor-name={anchorName}
            class={iconBtn}
          >
            <MsCall class="block size-7" />
          </button>
        {/snippet}

        {#snippet content ()}
          <div class="flex min-w-max flex-col gap-y-1.5 px-3 py-2.5 text-sm text-gray-600">
            {#if canCall}
              <div class="inline-flex items-center gap-2 pb-0.5 text-gray-500">
                In office
                <span>{tokyoTime}</span>
                <span>Tokyo</span>
              </div>
            {/if}
            <div class="pb-0.5 text-gray-500">
              Generally available Mon – Fri, {callHours}
            </div>
            <a
              href="tel:+15032503868"
              class="flex items-baseline justify-between gap-4 tabular-nums no-underline transition-colors hover:text-gray-800"
            >
              <span>US</span>
              <span>503 250 3868</span>
            </a>
            <a
              href="tel:+818049192027"
              class="flex items-baseline justify-between gap-4 tabular-nums no-underline transition-colors hover:text-gray-800"
            >
              <span>JP</span>
              <span>080 4919 2027</span>
            </a>
          </div>
        {/snippet}
      </PopoverMenu>
    </div>

    <div class="h-4 w-px shrink-0 bg-black/10"></div>

    <div class="flex items-center gap-5">
      <a href="/auth/privacy" class={legal}>Privacy</a>
      <a href="/auth/terms" class={legal}>Terms</a>
    </div>
  </div>
</footer>
