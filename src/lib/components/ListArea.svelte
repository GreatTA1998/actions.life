<script>
  import { user } from '$lib/store'
  import TodoList from '/src/routes/[user]/components/ListsArea/TodoList.svelte'
  import { getContext, onMount, tick } from 'svelte'
  import { db } from '$lib/db/init'
  import { collection, query, where, onSnapshot } from 'firebase/firestore'
  import { buildForest } from '$lib/db/tree.ts'
  import { WIDTHS } from '$lib/utils/constants.js'

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

  onMount(async () => {
    await tick() // computed sizes from `style` CSS are not ready yet
    logicAreaRect.set(
      () => document.querySelector('#list-area').getBoundingClientRect()
    )
    return onSnapshot(
      query(
        collection(db, `users/${$user.uid}/tasks`),
        where('onList', '==', true)
      ),
      (snapshot) => {
        const listTasks = snapshot.docs.map(doc => ({
          ...doc.data(), 
          id: doc.id
        }))
        trees.set(buildForest(listTasks))
      }
    )
  })
</script>

<div id="list-area" class="h-full relative overflow-auto hide-scrollbar"
  style:background-color="var(--todo-list-bg-color)"
>
  <TodoList trees={$trees}
    listWidth={xyScrolling ? `${WIDTHS.LIST}px` : 'auto'}
    style={xyScrolling ? wrappingColumnLayout : simpleLayout}
    isLargeFont={!xyScrolling}
  />       
</div>