<script>
  import TheSnackbar from './components/TheSnackbar.svelte'
  import NavbarContentLayout from '$lib/components/NavbarContentLayout.svelte'
  import DualView from '$lib/components/DualView.svelte'
  import TaskPopup from './components/TaskPopup/TaskPopup.svelte'
  import Settings from './components/Settings/index.svelte'
  import ExtendRoutines from './components/ExtendRoutines.svelte'
  import FloatingNavbar from '$lib/components/FloatingNavbar.svelte'
  import Discover from './mobile/Discover.svelte'
  import Calendar from '/src/routes/[user]/components/Calendar/Calendar.svelte'
  import UnifiedListArea from '$lib/components/UnifiedListArea.svelte'

  import { onDestroy, onMount } from 'svelte'
  import { user, loadingTasks, showSnackbar, isTaskPopupOpen, activeView } from '$lib/store'

  let unsub

  onMount(() => {
    loadingTasks.set(false)
  })

  onDestroy(() => {
    if (unsub) unsub()
  })
</script>

{#if $user.uid}
  <ExtendRoutines />

  {#if $showSnackbar}
    <TheSnackbar>Email copied to clipboard successfully.</TheSnackbar>
  {/if}

  <NavbarContentLayout>
    <div slot="content" class="relative z-0 flexbox" style="flex-grow: 1; height: 100%;">
      {#if $activeView === 'CALENDAR'}
        <DualView {child1} {child2} />

        {#snippet child1 ()}  
          <UnifiedListArea xyScrolling />
        {/snippet}

        {#snippet child2 ()}
          <Calendar />
        {/snippet}
      {:else if $activeView === 'DISCOVER'}
        <Discover />
      {:else if $activeView === 'SETTINGS'}
        <Settings />
      {/if}
    </div>
  </NavbarContentLayout>

  <FloatingNavbar position="bottom" />

  {#if $isTaskPopupOpen}
    <TaskPopup />
  {/if}
{/if}