<script>
  import { DateTime } from "luxon"
  import Templates from '/src/back-end/Templates'
  import {
    computeMillisecsDifference,
    ensureTwoDigits,
    getHHMM,
  } from "/src/helpers/everythingElse.js"

  import ReusableTaskElement from "$lib/ReusableTaskElement.svelte"
  import ReusablePhotoTaskElement from "$lib/ReusablePhotoTaskElement.svelte"
  import ReusableIconTaskElement from "$lib/ReusableIconTaskElement.svelte"
  import { onMount, createEventDispatcher, onDestroy } from "svelte"
  import {
    user,
    yPosWithinBlock,
    whatIsBeingDraggedFullObj,whatIsBeingDraggedID, whatIsBeingDragged,
    timestamps, getMinutesDiff,
    calEarliestHHMM, totalMinutes
  } from "/src/store"
  import ReusableCreateTaskDirectly from "$lib/ReusableCreateTaskDirectly.svelte"
  import ReusableCalendarColumnTimeIndicator from "$lib/ReusableCalendarColumnTimeIndicator.svelte"

  export let yyyyMMdd
  export let scheduledTasks = []
  export let pixelsPerHour

  let OverallContainer
  let isDirectlyCreatingTask = false
  let formFieldTopPadding = 40
  let yPosition
  let reusableTaskTemplates = null
  let pixelsPerMinute = pixelsPerHour / 60
  const dispatch = createEventDispatcher()

  $: originDT = DateTime.fromISO(yyyyMMdd).set({ 
    hour: Number($calEarliestHHMM.split(':')[0]), 
    minutes: Number($calEarliestHHMM.split(':')[1]) 
  })

  $: resultantDateClassObject = getResultantDateClassObject(yPosition)

  onMount(async () => {
    // task template dropdown
    const temp = await Templates.getAll({ userID: $user.uid, includeStats: false })
    reusableTaskTemplates = temp
  });

  onDestroy(() => {});

  function copyGetTrueY(e) {
    return (
      e.clientY +
      OverallContainer.scrollTop -
      OverallContainer.getBoundingClientRect().top -
      OverallContainer.style.paddingTop
    )
  }

  // computes the physical offset, within origin based on d1
  function computeOffsetGeneral({ d1, d2, pixelsPerMinute }) {
    const millisecsDifference = computeMillisecsDifference(d1, d2);

    // translate time difference to a physical distance
    const minutesDifference = millisecsDifference / (1000 * 60);
    const offset = minutesDifference * pixelsPerMinute;
    return offset;
  }

  let highlightedMinute = null;

  function dragover_handler(e) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  }

  /**
   * Calculate what the new time is by measuring offset from top of container
   * 
   * We don't just read the hh e.g. "24" from the hour block, 
   * because the drop_handler is defined outside of those hour <divs>
   * 
   * TODO: ensure the drop package is a valid task
   * 
   *     
    // TODO: in practice there is a small discrepancy between where the drop is and where the mouse is 
    // because the user aims with the image corner whereas the code reads the precise mouse pointer location
   */

  // How it works:
  //   1. Do origin + new difference to get the date object
  //   2. use the new date object to generate `startTime` and `startDate`
  function drop_handler (e) {
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return; // it means we're adjusting the duration but it triggers a drop event, and a dragend event must be followed by a drop event

    e.preventDefault();
    e.stopPropagation();
    highlightedMinute = null;

    // `trueY` is the end position of the mouse
    const finalMousePosY = copyGetTrueY(e);

    // account for dragging the block from really low or from really high up
    const trueY = finalMousePosY - $yPosWithinBlock;
    yPosWithinBlock.set(0);

    // resultant time based on difference difference
    const resultantDateClassObject = getResultantDateClassObject(trueY);
    const d = resultantDateClassObject;
    const hhmm = ensureTwoDigits(d.getHours()) + ":" + ensureTwoDigits(d.getMinutes());
    const mmdd = ensureTwoDigits(d.getMonth() + 1) + "/" + ensureTwoDigits(d.getDate());
    
    const [MM, DD] = mmdd.split('/')

    dispatch('task-update', { 
      id,
      keyValueChanges: {
        startTime: hhmm,
        startDateISO: `${d.getFullYear()}-${MM}-${DD}`
      }
    })

    whatIsBeingDraggedFullObj.set(null)
    whatIsBeingDraggedID.set('')
    whatIsBeingDragged.set('')
  }

  function getResultantDateClassObject (trueY) {
    const calendarStartAsMs = originDT.toMillis()

    const totalHoursDistance = trueY / pixelsPerHour;
    const totalMsDistance = totalHoursDistance * 60 * 60 * 1000;

    // Add them together: https://stackoverflow.com/a/12795802/7812829
    const resultantTimeInMs = calendarStartAsMs + totalMsDistance;
    const resultantDateClassObject = new Date(resultantTimeInMs);
    return resultantDateClassObject;
  }

  function getJSDateFromTask (task) {
    const dateTimeString = task.startDateISO + 'T' + task.startTime
    return new Date(dateTimeString)
  }
</script>

<!-- https://github.com/sveltejs/svelte/issues/6016 -->
<div bind:this={OverallContainer} class="overall-container">
  <div class="calendar-day-container unselectable"
    style="height: {$totalMinutes * pixelsPerMinute}px;"
    on:drop={e => drop_handler(e)}
    on:dragover={e => dragover_handler(e)}
    on:click|self={e => {
      isDirectlyCreatingTask = true;
      yPosition = copyGetTrueY(e);
    }} on:keydown
  >
    {#if $whatIsBeingDraggedFullObj || $user.hasGridlines}
      {#each $timestamps as timestamp}
        <div class="my-helper-gridline" 
          style="top: {getMinutesDiff({ calEarliestHHMM: $calEarliestHHMM, calLatestHHMM: timestamp }) * pixelsPerMinute}px;"
        >
        </div>
      {/each}
    {/if}

    {#each scheduledTasks as task, i (task.id)}
      <div class="task-absolute"
        style="
          top: {computeOffsetGeneral({
            d1: originDT.toJSDate(),
            d2: getJSDateFromTask(task),
            pixelsPerMinute
          })}px;
        "
      >
        {#if task.iconURL}
          <!-- TO-DO: think about how attaching photos to icon tasks work -->
          <ReusableIconTaskElement
            {task}
            pixelsPerHour={pixelsPerMinute * 60}
            fontSize={0.8}
            on:task-click
            on:task-update
          />
        {:else if task.imageDownloadURL}
          <ReusablePhotoTaskElement
            {task}
            pixelsPerHour={pixelsPerMinute * 60}
            fontSize={0.8}
            on:task-click
            on:task-update
          />
        {:else}
          <ReusableTaskElement
            {task}
            pixelsPerHour={pixelsPerMinute * 60}
            fontSize={0.8}
            hasCheckbox
            on:task-click
            on:task-update
          />
        {/if}
      </div>
    {/each}

    {#if isDirectlyCreatingTask}
      <div id="calendar-direct-task-div"
        style="top: {yPosition - formFieldTopPadding}px;"
      >
        <ReusableCreateTaskDirectly
          newTaskStartTime={getHHMM(resultantDateClassObject)}
          {resultantDateClassObject}
          on:new-root-task
          on:reset={() => isDirectlyCreatingTask = false}
        />
      </div>
    {/if}

    <!-- https://svelte.dev/tutorial/update
      "Scrolling is hard to achieve with purely a state-driven way"
    -->
    <!-- A wood-colored line that indicates the current time -->
    {#if yyyyMMdd === DateTime.now().toFormat('yyyy-MM-dd')}
      <ReusableCalendarColumnTimeIndicator
        {originDT}
        {pixelsPerMinute}
      />
    {/if}
  </div>
</div>

<style lang="scss">
  #calendar-direct-task-div {
    position: absolute;
    width: 98%; 
    padding-left: 0px; 
    padding-right: 0px;
  }

  .task-absolute {
    position: absolute; 
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    width: 94%;
  }

  .my-helper-gridline {
    position: absolute;
    width: 100%;
    height: 0px;
    border-bottom: 1px solid var(--grid-color);
    // ChatGPT suggested this blue for max contrast: hsl(210, 100%, 40%);
  }

  .current-time-indicator-container {
    display: block;
    align-items: center;
    position: absolute;
    width: var(--width-calendar-day-section);
    pointer-events: none;
  }

  /* DO NOT REMOVE, BREAKS DRAG-AND-DROP AND DURATION ADJUSTMENT */
  .overall-container {
    position: relative;
    height: fit-content;
    overflow-y: hidden;
    overflow-x: hidden;
    width: var(--width-calendar-day-section);
    background-color: var(--calendar-bg-color);
    outline: 1px solid var(--grid-color);
  }

  .highlighted-background {
    background: rgb(82, 180, 251);
  }

  .calendar-day-container {
    width: 100%;
  }

  .green-text {
    color: #0085ff;
  }

  /* VERDICT: absolute works
  "Independence" is the best word you can ever hear in programming */
  .timestamp-number {
    position: absolute;
    left: 5px;
    font-size: 0.7rem;
  }

  .visible-line {
    border-top: 1px solid rgb(195, 195, 195);
  }
</style>
