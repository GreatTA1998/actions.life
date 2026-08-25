<script>
  import SiGithub from 'virtual:icons/simple-icons/github'
  import SiYoutube from 'virtual:icons/simple-icons/youtube'

  const links = [
    {
      href: 'https://github.com/project-feynman/actions.life',
      Icon: SiGithub,
      label: 'Source code'
    },
    {
      href: 'https://www.youtube.com/watch?v=SmrK_Ni918o',
      Icon: SiYoutube,
      label: 'In-depth tutorial'
    }
  ]
</script>

{#each links as { href, Icon, label } (href)}
  <a
    {href}
    target="_blank"
    rel="noreferrer"
    class="inline-flex items-center gap-1.5 rounded-full border border-solid border-black/20 bg-transparent px-3.5 py-2.5 text-sm leading-none tracking-[-0.015em] text-gray-500 no-underline transition-colors hover:border-black/30 hover:text-gray-700"
  >
    <Icon class="size-3.5 shrink-0" />
    {label}
  </a>
{/each}
