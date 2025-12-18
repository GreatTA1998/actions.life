<script>
  import NavbarContentLayout from '$lib/components/NavbarContentLayout.svelte'
  import DualView from '$lib/components/DualView.svelte'
  import Settings from './components/Settings/index.svelte'
  import FloatingNavbar from '$lib/components/FloatingNavbar.svelte'
  import Discover from './mobile/Discover.svelte'
  import Calendar from '/src/routes/[user]/components/Calendar/Calendar.svelte'
  import UnifiedListArea from '$lib/components/UnifiedListArea.svelte'
  import { activeView } from '$lib/store'
</script>

<NavbarContentLayout>
  <div slot="content" class="relative z-0 flexbox h-full" style="flex-grow: 1;">
    {#if $activeView === 'CALENDAR'}
      <DualView {child1} {child2} />
      {#snippet child1 ()}<UnifiedListArea xyScrolling />{/snippet}
      {#snippet child2 ()}<Calendar />{/snippet}
    {:else if $activeView === 'DISCOVER'}
      <Discover />
    {:else if $activeView === 'SETTINGS'}
      <Settings />
    {/if}
  </div>
</NavbarContentLayout>

<FloatingNavbar position="bottom" />