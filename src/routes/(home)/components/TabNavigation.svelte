<script>
  export let currentIdx = 0
  export let onTabClick = () => {}
</script>

<div class="my-tab-container">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="my-tab-item"
    on:click={() => onTabClick(0)}
    class:my-active-tab={currentIdx === 0}
  >
    <span class="material-symbols-outlined my-tab-icon"> park </span>
    <div class="my-tab-name">Branching To-do</div>
  </div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="my-tab-item"
    on:click={() => onTabClick(1)}
    class:my-active-tab={currentIdx === 1}
  >
    <span class="material-symbols-outlined my-tab-icon">
      restart_alt
    </span>
    <div class="my-tab-name">Reusable Tasks</div>
  </div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="my-tab-item"
    on:click={() => onTabClick(2)}
    class:my-active-tab={currentIdx === 2}
  >
    <span class="material-symbols-outlined my-tab-icon">
      sports_score
    </span>
    <div class="my-tab-name">Uncertain Goals</div>
  </div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div
    class="my-tab-item"
    on:click={() => onTabClick(3)}
    class:my-active-tab={currentIdx === 3}
  >
    <span class="material-symbols-outlined my-tab-icon"> Photo </span>
    <div class="my-tab-name">Contextual Photos</div>
  </div>
</div>

<style lang="scss">
  .my-tab-item {
    width: 16vw;
    border-bottom: 0.3vw solid rgb(219, 219, 219);
    font-weight: 500;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    padding: 0.5vw;
    cursor: pointer;
    color: rgb(120, 120, 120);
  }

  .my-active-tab {
    border-bottom: 0.3vw solid var(--logo-twig-color);
    color: var(--logo-twig-color);
    font-weight: 600;
  }

  .my-tab-name {
    margin-left: 0.2vw;
    font-size: 1.3vw;
    text-align: center;
  }

  .my-tab-container {
    display: flex;
    margin-top: 3vw;
  }

  .my-tab-icon {
    font-size: 2.5vw;
    font-weight: 600;
  }

  @media (max-width: 767.99px) {
    .my-tab-container {
      margin-top: 16px;
    }

    .my-tab-item {
      width: 120px;
    }

    .my-tab-name {
      font-size: 14px;
      text-align: center;
      margin-top: 2px;
    }

    .my-tab-icon {
      font-size: 24px;
    }

    .my-tab-item {
      border-bottom: 3px solid rgb(219, 219, 219);
    }

    .my-active-tab {
      border-bottom: 3px solid var(--logo-twig-color);
    }
  }
</style> 