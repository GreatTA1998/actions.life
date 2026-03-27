<script>
  import NavbarContentLayout from '$lib/components/NavbarContentLayout.svelte'
  import FloatingNavbar from '$lib/components/FloatingNavbar.svelte'
  import AppContent from '$lib/components/AppContent.svelte'
</script>

<NavbarContentLayout>
  <div slot="content" class="grow relative z-0 flex h-full">
    <AppContent />
  </div>
</NavbarContentLayout>

<FloatingNavbar position="bottom" />