{#if !$isSnackbarHidden}
  <div class="snack-wrap">
    <div class="snackbar" style="display: flex; align-items: center;">
      <slot>
        <p>Root task completed.</p>

        <div style="margin-right: 2px; margin-left: auto;">

        <a on:click={undoComplete}>Undo</a>

        </div>
      </slot>
    </div>
  </div>
{/if}

<script>
  import { createEventDispatcher } from "svelte"
  import { mostRecentlyCompletedTaskID, isSnackbarHidden } from '/src/store'

  $: if ($mostRecentlyCompletedTaskID) {
    resetDisappearCountdown()
  }

  function resetDisappearCountdown () {
    isSnackbarHidden.set(false)
    clearTimeout(countdownID)
    countdownID = setTimeout(() => {
      isSnackbarHidden.set(true)
    }, 5000)
  }

  let countdownID = ''

  const dispatch = createEventDispatcher()

  function undoComplete () {
    dispatch('undo-task-completion')
  }
</script>

<style>
a {
  flex: 1;
  background-color: #323232;
  color: #fff;
  padding-top: 5px; 
  padding-bottom: 5px;
  padding-left: 6px;
  padding-right: 6px;
  text-align: center;
  text-decoration: none;
  transition: all 0.2s ease-out;
  border: 1px solid #000;
  font-size: 1rem;
  height: 5px;
}

a:hover,
a:focus {
  border: 1px solid #000;
  background-color: #fff;
  color: #323232;
}

.snack-wrap {
  display:block;
  position:fixed;
  bottom:24px;
  left: 50%;
  right: 50%;
  padding:0px;

  margin-left: -225px; 
  /* half of width */
  width: 450px;

  z-index: 1;
  border-radius: 8px;
}

.snackbar {
  display:block;
  background:#222;
  border:#f2f2f2;
  padding:10px 40px 10px 20px;
  color:#fff;
  position:relative;
  left:0px;
  z-index:9;
  border-radius: 16px;
} 

/* .animated {
  animation-name: snackbar-show;
  animation-duration: 1s;
  animation-direction: forwards;
  animation-timing-function: ease-in-out;
  animation-delay:1s;
  animation-fill-mode: forwards;
} */
/* .snackclose:checked~.snackbar, .snackclose:checked, .snackclose:checked+label {
  animation-name: snackbar-hide;
  animation-delay:0s;
} */
@keyframes snackbar-show {
   0%{ bottom:-70px; }
  90%, 95% {bottom:15px; }
  92.5%, 100% {bottom:10px; }
} 
/* @keyframes snackbar-hide {
   0%, 7.5% {bottom:10px; }
  5%,10% {bottom:15px; }
  100% {bottom:-70px; }
} */
</style>