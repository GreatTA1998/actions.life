<script>
  import { DateTime } from 'luxon'
  import { createSubscriber } from 'svelte/reactivity'
  import SiGithub from 'virtual:icons/simple-icons/github'
  import SiYoutube from 'virtual:icons/simple-icons/youtube'

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

  const item = 'whitespace-nowrap text-sm leading-none tracking-[-0.015em] text-gray-500 no-underline'
</script>

<footer class="mt-auto w-full pt-16">
  <div class="flex flex-wrap items-center gap-x-6 gap-y-3 bg-[#ececec] px-[clamp(1.25rem,5vw,2.5rem)] py-6">
    <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
      <a href="mailto:elton@actions.life" class={item}>elton@actions.life</a>
      <a href="tel:+15032503868" class={[item, 'tabular-nums']}>US 503 250 3868</a>
      <a href="tel:+818049192027" class={[item, 'tabular-nums']}>JP 080 4919 2027</a>
      <span class="inline-flex items-center gap-1.5 whitespace-nowrap text-sm leading-none text-gray-500">
        <span class={['size-1 shrink-0 rounded-full', canCall ? 'bg-blue-500' : 'bg-red-500']}></span>
        {canCall ? 'In Tokyo office' : 'Out of office'}
        {tokyoTime} local time
      </span>
    </div>

    <div class="ml-auto flex items-center gap-5">
      <a href="https://github.com/project-feynman/actions.life" target="_blank" rel="noreferrer" class="text-gray-500"><SiGithub class="size-6" /></a>
      <a href="https://www.youtube.com/watch?v=SmrK_Ni918o" target="_blank" rel="noreferrer" class="text-gray-500"><SiYoutube class="size-6" /></a>
      <a href="/auth/privacy" class={item}>Privacy</a>
      <a href="/auth/terms" class={item}>Terms</a>
    </div>
  </div>
</footer>
