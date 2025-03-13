<script>
  import { page } from '$app/stores';

  console.error($page.error)
</script>

<h1>Error {$page.status}: {$page.error.message}</h1>

{#if $page.error.stack}
  <pre>{$page.error.stack}</pre>
{/if}

<div>{$page.error}</div>