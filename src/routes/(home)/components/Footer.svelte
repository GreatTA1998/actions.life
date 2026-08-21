<script>
  import SiGithub from 'virtual:icons/simple-icons/github'
  import SiYoutube from 'virtual:icons/simple-icons/youtube'
  import SiX from 'virtual:icons/simple-icons/x'

  let { stars = null } = $props()

  const socials = $derived([
    {
      href: 'https://github.com/project-feynman/actions.life',
      name: 'GitHub',
      desc: 'Source code',
      count: stars,
      Icon: SiGithub
    },
    {
      href: 'https://www.youtube.com/@actions.life',
      name: 'YouTube',
      desc: 'In-depth tutorials',
      Icon: SiYoutube
    },
    {
      href: 'https://x.com/eltonlin1998',
      name: 'X',
      desc: 'News & updates',
      Icon: SiX
    }
  ])

  function formatCount (n) {
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
  }
</script>

<footer class="flex flex-col gap-8 border-t border-black/[0.06] pt-10 pb-12 sm:flex-row sm:items-end sm:justify-between">
  <nav class="flex flex-wrap gap-x-10 gap-y-6">
    {#each socials as { href, name, desc, count, Icon } (name)}
      <a
        {href}
        target="_blank"
        rel="noreferrer"
        class="group flex items-start gap-2.5 no-underline"
      >
        <Icon class="mt-[3px] size-4 shrink-0 text-gray-500 transition-colors group-hover:text-gray-800" />
        <span class="flex flex-col gap-0.5">
          <span class="flex items-baseline gap-2 text-sm font-medium tracking-tight text-gray-600 transition-colors group-hover:text-gray-800">
            {name}
            {#if count != null}
              <span class="tabular-nums text-gray-500 font-normal">{formatCount(count)}</span>
            {/if}
          </span>
          <span class="text-[13px] leading-snug text-gray-500 transition-colors group-hover:text-gray-600">
            {desc}
          </span>
        </span>
      </a>
    {/each}
  </nav>

  <div class="flex gap-x-5">
    <a href="/auth/privacy" class="text-sm text-gray-500 no-underline transition-colors hover:text-gray-800">
      Privacy
    </a>
    <a href="/auth/terms" class="text-sm text-gray-500 no-underline transition-colors hover:text-gray-800">
      Terms
    </a>
  </div>
</footer>
