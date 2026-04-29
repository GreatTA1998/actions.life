<script>
  import { doc, onSnapshot } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { onMount } from 'svelte'

  export let theDoc = null
  export let docPath = ''

  onMount(() => onSnapshot(
    doc(db, docPath), 
    doc => theDoc = { ...doc.data(), id: doc.id }
  ))
</script>

<slot {theDoc}>

</slot>
