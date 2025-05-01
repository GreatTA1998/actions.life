<!-- BASED ON: https://stackoverflow.com/a/24979148/7812829 -->

<div class="box">
  <div class="row header">
    <slot name="navbar">

    </slot>
  </div>

  <div class="row content">
    <slot name="content">

    </slot>
  </div>
</div>

<style>
  /* Below are based on for having a fixed height Navbar, with a content div that fills up the remaining space */
  .box {
    display: flex;
    flex-flow: column;
    height: 100dvh; /* dvh vs svh */
    box-sizing: border-box ;
  }

  .box .row.header {
    flex: 0 1 auto;
  }

  .box .row.content {
    display: flex;
    flex-flow: column;
    flex: 1 1 auto;
    overflow-y: auto;
  }
</style>