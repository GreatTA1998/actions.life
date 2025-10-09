<script>
  let { 
    taskObj, 
    onclick = () => {},
    color = ''
  } = $props()

  let subtasks = $derived(taskObj.children)
</script>

<button {onclick} class="subtask-progress-badge" style="color: {color};">
  <span class="material-symbols-outlined" style="font-size: 12px;">check_circle</span>
  <span style="font-size: 12px;">{subtasks.filter(child => child.isDone).length}/{subtasks.length}</span>
</button>

<style>
  .subtask-progress-badge {
    display: flex;
    align-items: center;
    column-gap: 2px;
    font-weight: 400;
    background: none;
    border-radius: 0;
    padding: 0;
  }
</style>