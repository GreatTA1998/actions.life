<script>
  import { createEventDispatcher, onMount, onDestroy, tick } from "svelte";
  import { mostRecentlyCompletedTaskID } from "/src/store";
  import _ from "lodash";
  import RecursiveBulletPoint from "$lib/DetailedCardPopup/RecursiveBulletPoint.svelte";
  import UXFormTextArea from "$lib/DetailedCardPopup/UXFormTextArea.svelte";
  import ReusableCheckbox from "$lib/ReusableCheckbox.svelte";
  import StartTimeDurationNotify from "$lib/DetailedCardPopup/StartTimeDurationNotify.svelte";
  import PhotoUpload from "./PhotoUpload.svelte";
  import { findTaskByID } from "/src/helpers/utils.js";

  export let taskObject;

  let TaskImageElem;
  let PopupElem;

  $: currentDeadlineValue =
    (taskObject.deadlineDate || "") +
    (taskObject.deadlineDate && taskObject.deadlineTime ? " " : "") +
    (taskObject.deadlineTime || "");

  const dispatch = createEventDispatcher();

  // don't delete yet, as these might be needed for input element bindings
  let notesAboutTask = taskObject.notes || "";
  let titleOfTask = taskObject.name || "";
  let isViewingPhoto = false;

  onMount(() => {
    if (taskObject.imageDownloadURL) {
      // solution based on Claude
      TaskImageElem.onload = () => {
        const marginFactor = 0.9;
        const viewportHeight = marginFactor * window.innerHeight;
        const viewportWidth = marginFactor * window.innerWidth;

        const { naturalWidth, naturalHeight } = TaskImageElem;

        const imageAspectRatio = naturalWidth / naturalHeight;
        const viewportAspectRatio = viewportWidth / viewportHeight;

        let maxWidth, maxHeight;

        if (imageAspectRatio > viewportAspectRatio) {
          // Image is wider than the viewport, so scale based on width
          maxWidth = viewportWidth;
          maxHeight = Math.floor(viewportWidth / imageAspectRatio);
        } else {
          // Image is taller than the viewport, so scale based on height
          maxHeight = viewportHeight;
          maxWidth = Math.floor(viewportHeight * imageAspectRatio);
        }

        PopupElem.style.width = maxWidth + "px";
        PopupElem.style.height = maxHeight + "px";

        return { maxWidth, maxHeight };
      };
    }
  });

  // the other place to pay attention to is <RecursiveTaskElement/>
  // but the idea is still the same, provide an "undo"
  // for root level tasks because they disappear on completion
  function handleCheckboxChange(e) {
    if (taskObject.parentID === "") {
      mostRecentlyCompletedTaskID.set(taskObject.id);
    }
    dispatch("task-checkbox-change", {
      id: taskObject.id,
      isDone: e.target.checked,
    });

    dispatch("card-close");
  }

  const debouncedSaveTitle = _.debounce(saveTitle, 800);
  const debouncedSaveNotes = _.debounce(saveNotes, 1500);

  function handleDelete() {
    dispatch("task-delete", { ...taskObject });
    dispatch("card-close");
  }
  function handleDeleteChildren() {
    dispatch("task-delete-children", { ...taskObject });
    dispatch("card-close");
  }

  function handleClickOutside(e) {
    dispatch("card-close");
  }

  function saveNotes(newVal) {
    taskObject.notes = newVal;
    dispatch("task-update", {
      id: taskObject.id,
      keyValueChanges: { notes: newVal },
    });
  }

  function saveTitle(newVal) {
    dispatch("task-update", {
      id: taskObject.id,
      keyValueChanges: { name: newVal },
    });
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="fullscreen-invisible-modular-popup-layer"
  on:click|self={handleClickOutside}
  style="z-index: 10;"
>
  <div class="detailed-card-popup" bind:this={PopupElem}>
    {#if taskObject.imageDownloadURL}
      <!-- svelte-ignore a11y-missing-attribute -->
      <img
        bind:this={TaskImageElem}
        on:click|self={() => (isViewingPhoto ? (isViewingPhoto = false) : "")}
        src={taskObject.imageDownloadURL}
        class:blurred-image={false}
        class:clear-image={isViewingPhoto}
        style="width: 100%; height: 100%;"
      />
    {/if}

    <div style="padding: 24px;">
      <div style="display: flex; align-items: center;">
        <ReusableCheckbox
          value={taskObject.isDone}
          on:change={(e) => handleCheckboxChange(e)}
          zoom={1.2}
        />

        <input
          type="text"
          bind:value={titleOfTask}
          on:input={(e) => debouncedSaveTitle(e.target.value)}
          placeholder="Untitled"
          style="margin-left: 12px; width: 100%; box-sizing: border-box; font-size: 24px;"
        />
      </div>

      <StartTimeDurationNotify {taskObject} on:task-update />

      <div style="width: 100%; margin-top: 24px; margin-bottom: 24px;">
        <UXFormTextArea
          fieldLabel="Notes"
          value={notesAboutTask}
          on:input={(e) => debouncedSaveNotes(e.detail)}
          placeholder=""
        />
      </div>

      <div
        style="margin-top: 0px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;"
      >
        <div style="display: flex; align-items: center; width: 100%; justify-content: space-between; width: 100%;">
          <PhotoUpload {taskObject} />
          <div style="display: flex; align-items: center; gap: 12px;">
            <span
              class="material-symbols-outlined"
              on:click|stopPropagation={handleDelete}
              style="cursor: pointer; margin-left: auto; right: 0px; border: 1px solid grey; border-radius: 24px; padding: 4px;"
            >
              delete
            </span>
            <span
              class="material-symbols-outlined delete-button"
              on:click|stopPropagation={handleDeleteChildren}
              style="cursor: pointer; margin-left: auto; right: 0px; border: 1px solid grey; border-radius: 24px; padding: 4px; position: relative;"
            >
              bomb
              <span class="tooltip">Delete this task and all its children</span>
            </span>
          </div>
        </div>
      </div>

      <div
        style="font-size: 1rem; margin-top: 16px; margin-bottom: 12px; font-weight: 400;"
      >
        Tree History
      </div>

      <div style="max-height: 500px; overflow-y: auto;">
        <RecursiveBulletPoint
          taskObject={taskObject.parentID
            ? findTaskByID(taskObject.parentID)
            : taskObject}
          originalPopupTask={taskObject}
          on:task-click
          on:task-checkbox-change
        ></RecursiveBulletPoint>
      </div>
    </div>
    <!-- End of padding container -->
  </div>
  <!-- End of detailed-card-popup -->
</div>

<style src="./DetailedCardPopup.css"></style>
