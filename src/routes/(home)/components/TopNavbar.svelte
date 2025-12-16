<!-- background: linear-gradient(135deg, rgba(247, 240, 225, 0.9), rgba(200, 220, 210, 0.8)); backdrop-filter: blur(10px); -->
<div
  class="top-navbar transparent-glow-navbar"
  style="background: none; border-bottom: 0px solid var(--faint-color); display: flex; align-items: center; height: 54px; padding-left: 2vw;"
>
  <img src="/logo-no-bg.png" alt="logo"
    style="margin-left: 0vw; width: 38px; height: 38px;"
  />
</div>

<style>
  .transparent-glow-navbar {
    background: linear-gradient(135deg, rgba(247, 240, 225, 0.9), rgba(200, 220, 210, 0.8));
    border-bottom: none;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    /* box-shadow: 0 2px 20px rgba(180, 200, 190, 0.1); */
  }

  .github-link {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    border-radius: 6px;
    transition: all 0.2s ease;
    background: transparent;
    border: none;
    text-decoration: none;
  }

  .github-link:hover {
    background: rgba(180, 200, 190, 0.15);
    transform: translateY(-1px);
  }

  .github-link svg {
    opacity: 0.7;
    transition: opacity 0.2s ease;
    filter: sepia(20%) saturate(80%) hue-rotate(80deg);
  }

  .github-link:hover svg {
    opacity: 1;
  }
</style>