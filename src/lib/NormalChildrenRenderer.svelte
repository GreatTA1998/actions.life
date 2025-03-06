<script>
  import RecursiveTaskElement from '$lib/RecursiveTaskElement.svelte';
  import ReusableHelperDropzone from '$lib/ReusableHelperDropzone.svelte';
  import { createEventDispatcher } from 'svelte';
  
  export let children = [];
  export let depth;
  export let parentID;
  export let ancestorRoomIDs = [];
  export let willShowCheckbox = true;
  export let isLargeFont = false;
  export let colorForDebugging;
  
  const dispatch = createEventDispatcher();
  const indentationAmount = 32;
  
  // Even though we don't sort by date in normal mode,
  // we might need to access the startDateISO property in the future
</script>

<div class="normal-children-container">
  <!-- First dropzone -->
  {#if children.length === 0}
    <div>
      <ReusableHelperDropzone
        ancestorRoomIDs={[parentID, ...ancestorRoomIDs]}
        roomsInThisLevel={children}
        idxInThisLevel={0}
        {parentID}
        {colorForDebugging}
        listID={children[0]?.listID}
      />
    </div>
  {/if}
  
  <!-- Render children in original order with standard indentation -->
  {#each children as child, i (child.id)}
    <RecursiveTaskElement
      taskObj={child}
      {depth}
      {willShowCheckbox}
      {isLargeFont}
      ancestorRoomIDs={[parentID, ...ancestorRoomIDs]}
      {colorForDebugging}
      on:task-click
      on:task-create
      on:task-update
    />
    
    <!-- Dropzone logic -->
    <div class:absolute-bottom={i === children.length - 1}>
      <ReusableHelperDropzone
        ancestorRoomIDs={[parentID, ...ancestorRoomIDs]}
        roomsInThisLevel={children}
        idxInThisLevel={i + 1}
        {parentID}
        {colorForDebugging}
        listID={child.listID}
      />
    </div>
  {/each}
</div>

<style>
  .normal-children-container {
    margin-left: 32px;
  }
  
  .absolute-bottom {
    position: absolute;
    bottom: -18px;
  }
</style> 