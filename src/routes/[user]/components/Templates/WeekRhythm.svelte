<script>
   const dayOfWeekSymbol = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

   export let crontab
</script>

<div style="display: flex;">
  {#each dayOfWeekSymbol as _, i}
    <div
      class="day-of-week-circle"
      class:highlighted={crontab.split(' ')[4].split(',').includes((i + 1).toString())}
    ></div>
  {/each}
</div>

<style>
  .day-of-week-circle {
    border-radius: 50%;
    background-color: rgb(223, 223, 223);
    width: 6px;
    height: 6px;
    margin: 2px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: 1px solid rgb(111, 111, 111);
  }

  .highlighted {
    background-color: var(--rhythm-highlight-color);
    border: none;
  }
</style>