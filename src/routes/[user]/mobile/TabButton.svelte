<script>
  import Icon from '@iconify/svelte'

  let {
    icon,
    active = false,
    onclick = () => {}
  } = $props()
</script>

<button 
  class="tab-button flexbox" 
  class:active={active}
  onclick={onclick}
>
  <!-- <Icon icon="material-symbols-light:calendar-month" style="font-size: 1.8rem;"/> -->
  <Icon icon="material-symbols-light:{icon}" style="font-size: 1.8rem;"/>
</button>

<style>
  .tab-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2px 6px;
    background: transparent;
    position: relative;
  }

  .tab-button.active::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    right: 0;
    height: 2px;
    background: rgb(0, 0, 0);
    border-radius: 1px;
    z-index: 1;
  }
</style>

