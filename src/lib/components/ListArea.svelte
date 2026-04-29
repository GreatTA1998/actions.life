<script>
  import { firebaseAuth } from '$lib/store'
  import TodoList from '/src/routes/[user]/components/ListsArea/TodoList.svelte'
  import { getContext, onMount, tick } from 'svelte'
  import { db } from '$lib/db/init'
  import { updateCache, cleanupCache } from '$lib/store'
  import { collection, query, where, onSnapshot } from 'firebase/firestore'
  import { buildForest } from '$lib/db/tree.ts'

  let { xyScrolling } = $props()
  const { logicAreaRect } = getContext('drag-drop')
  const { trees } = getContext('app')

  const wrappingColumnLayout = `
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    align-items: start; /* default is stretch */
    align-content: start; /* prevents column gaps from widening when the area gets larger */
    column-gap: 24px; /* matches dropzone's height */
    padding: 0 24px; /* add same spacing on left/right sides to match column gap */
    height: 100%;
    min-width: max-content;
  `
  const simpleLayout = `height: 100%;`
  
  let persistTasks
  const unsubFuncs = []

  onMount(async () => {
    await tick() // computed sizes from `style` CSS are not ready yet
    logicAreaRect.set(
      () => document.querySelector('#list-area').getBoundingClientRect()
    )
    listenToTasks($firebaseAuth.currentUser.uid)
  })

  function listenToTasks (uid) {
    const tasksCollection = collection(db, `users/${uid}/tasks`)
    setupListener(
      query(tasksCollection, where('onList', '==', true)),
      data => { 
        persistTasks = data 
        updateCache(persistTasks)
      }
    )
  }

  function setupListener (ref, callback) {
    unsubFuncs.push(
      onSnapshot(ref, snapshot => {
        const mappedData = snapshot.docs.map(doc => ({
          ...doc.data(), 
          id: doc.id
        }))
        
        callback(mappedData)
    
        if (persistTasks) {
          buildTreeMap(persistTasks)
        }
      })
    )
  }

  function buildTreeMap (tasks) {
    trees.set(
      buildForest(tasks)
    )
  }

  // TO-DO: bugged, unused for now
  export function cleanup () {
    for (const unsub of unsubFuncs) {
      unsub()
    }
    cleanupCache(persistTasks)
    trees.set(null)
  }
</script>

<div id="list-area" class="h-full relative overflow-auto hide-scrollbar">
  <TodoList trees={$trees}
    listWidth={xyScrolling ? 'fit-content' : '100%'}
    style={xyScrolling ? wrappingColumnLayout : simpleLayout}
    isLargeFont={!xyScrolling}
  />       
</div>

<style>
  #list-area {
    background-color: var(--todo-list-bg-color);
  }
</style>