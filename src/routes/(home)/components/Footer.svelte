<script>
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

  const heading = 'm-0 text-[13px] font-medium leading-none tracking-[-0.015em] text-gray-600'
  const item = 'text-[13px] leading-snug tracking-[-0.015em] text-gray-500 no-underline transition-colors hover:text-gray-800'
</script>

<footer class="mx-auto flex w-full max-w-5xl items-start justify-between gap-8 border-t border-black/[0.06] pt-12 pb-16">
  <div class="flex flex-col gap-2.5">
    <h2 class={heading}>Contact</h2>
    <a href="mailto:elton@actions.life" class={item}>elton@actions.life</a>
    <a href="tel:+15032503868" class={[item, 'tabular-nums']}>US 503 250 3868</a>
    <a href="tel:+818049192027" class={[item, 'tabular-nums']}>JP 080 4919 2027</a>
    <div class="flex items-start gap-1.5 text-[13px] leading-snug tracking-[-0.015em] text-gray-500">
      <span class={['mt-[0.45em] size-1 shrink-0 rounded-full', canCall ? 'bg-blue-500' : 'bg-red-500']}></span>
      <span>
        {canCall ? 'In Tokyo office' : 'Out of office'}
        {tokyoTime} local time
      </span>
    </div>
  </div>

  <div class="flex flex-col items-end gap-2.5 text-right">
    <h2 class={heading}>Legal</h2>
    <a href="/auth/privacy" class={item}>Privacy</a>
    <a href="/auth/terms" class={item}>Terms</a>
  </div>
</footer>
