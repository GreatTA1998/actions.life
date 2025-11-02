<script>
  import TaskPopupContent from './TaskPopupContent.svelte'
  import BasePopup from '$lib/components/BasePopup.svelte'
  import { getContext } from 'svelte'

  const { tasksCache, clickedTaskID, closeTaskPopup } = getContext('app')

  let taskObject = $derived($tasksCache[$clickedTaskID])
</script>

{#if taskObject}
  <BasePopup on:click-outside={closeTaskPopup} zIndex={4} padding={0}>
    <TaskPopupContent />
  </BasePopup>
{/if}