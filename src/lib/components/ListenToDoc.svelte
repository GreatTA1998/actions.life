<script>
  import { doc, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'

  let {
    theDoc = null,
    docPath = '',
    children = () => {}
  } = $props()

  $effect(() => 
    onSnapshot(
      doc(db, docPath), 
      doc => theDoc = { ...doc.data(), id: doc.id }
    )
  )
</script>

{#if theDoc}
  {@render children(theDoc)}
{/if}