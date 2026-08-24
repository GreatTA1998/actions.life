<script>
  import SiGithub from 'virtual:icons/simple-icons/github'
  import SiYoutube from 'virtual:icons/simple-icons/youtube'

  const links = [
    {
      href: 'https://github.com/project-feynman/actions.life',
      Icon: SiGithub,
      label: 'Open source'
    },
    {
      href: 'https://www.youtube.com/@actions_life',
      Icon: SiYoutube,
      label: 'In-depth tutorials'
    }
  ]
</script>

<div class="flex flex-wrap items-center gap-x-8 gap-y-3">
  {#each links as { href, Icon, label } (href)}
    <a
      {href}
      target="_blank"
      rel="noreferrer"
      class="inline-flex items-center gap-2.5 text-[1.0625rem] leading-none tracking-[-0.015em] text-gray-700 no-underline transition-colors hover:text-gray-950"
    >
      <Icon class="size-6 shrink-0" />
      {label}
    </a>
  {/each}
</div>
