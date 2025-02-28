<script>
  export let theDoc = null
  export let docPath = ''

  import { doc, onSnapshot } from 'firebase/firestore'
  import { db } from '/src/back-end/firestoreConnection.js'

  let unsubListener = null

  $: if (docPath) {
    destroyAndCreateListener()
  }

  function destroyAndCreateListener () {
    theDoc = null
    if (unsubListener) unsubListener()
    unsubListener = onSnapshot(doc(db, docPath), doc => {
      theDoc = { ...doc.data(), id: doc.id }
    })
  }
</script>

<slot theDoc={theDoc}>

</slot>
