<script>
  import SiGithub from 'virtual:icons/simple-icons/github'
  import SiYoutube from 'virtual:icons/simple-icons/youtube'
  import SiX from 'virtual:icons/simple-icons/x'

  let { stars = null } = $props()

  function formatCount (n) {
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
  }
</script>

<footer class="flex flex-col gap-8 border-t border-black/[0.06] pt-10 pb-12 sm:flex-row sm:items-end sm:justify-between">
  <nav class="flex flex-wrap items-center gap-x-10 gap-y-6">
    <a
      href="https://github.com/project-feynman/actions.life"
      target="_blank"
      rel="noreferrer"
      class="group inline-flex items-center gap-2 no-underline"
    >
      <span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-500 transition-colors group-hover:bg-gray-800">
        <SiGithub class="size-3 text-white" />
      </span>
      {#if stars != null}
        <span class="text-sm font-medium tabular-nums tracking-tight text-gray-500 transition-colors group-hover:text-gray-800">
          {formatCount(stars)}
        </span>
      {:else}
        <span class="text-sm text-gray-500 transition-colors group-hover:text-gray-800">Source code</span>
      {/if}
    </a>

    <a
      href="https://www.youtube.com/@actions.life"
      target="_blank"
      rel="noreferrer"
      class="group inline-flex items-center gap-2.5 no-underline"
    >
      <SiYoutube class="size-4 shrink-0 text-gray-500 transition-colors group-hover:text-gray-800" />
      <span class="text-sm text-gray-500 transition-colors group-hover:text-gray-800">In-depth tutorials</span>
    </a>

    <a
      href="https://x.com/eltonlin1998"
      target="_blank"
      rel="noreferrer"
      class="group inline-flex items-center gap-2.5 no-underline"
    >
      <SiX class="size-4 shrink-0 text-gray-500 transition-colors group-hover:text-gray-800" />
      <span class="text-sm text-gray-500 transition-colors group-hover:text-gray-800">News & updates</span>
    </a>
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
