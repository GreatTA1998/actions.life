{#if $trees}
  <TodoList
    treesToDisplay={$trees}
    style="
      background-color: transparent;
      padding-top: var(--main-content-top-margin); 
      border-radius: 16px;
    "
    willShowCheckbox={false}
    isLargeFont={true}
    let:startTypingNewTask={startTypingNewTask}
  >
    <slot {startTypingNewTask}>
    
    </slot>
  </TodoList>
{/if}

<script>
  import TodoList from '../components/ListsArea/TodoList.svelte'
  import { user } from '/src/lib/store'
  import { listenToTasks, trees } from '../components/ListsArea/service'
  import { onMount } from 'svelte'

  onMount(() => {
    listenToTasks($user.uid)
  })
</script>