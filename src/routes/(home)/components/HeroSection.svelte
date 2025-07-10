<script>
  import LoginGoogle from '$lib/components/LoginGoogle.svelte'
</script>

<div style="display: flex; align-items: center; justify-content: space-between;">
  <div class="hero-section" style="display: flex; flex-direction: column; row-gap: 16px;">
    <div class="hero-title">Coordinate multiple life priorities on one calendar</div>

    <div style="display: flex; flex-wrap: wrap;">
      <div class="secondary-description">
        On actions.life, small habits, long-term timelines and scheduled events all fit together into a single picture.
      </div>
    </div>

    <div>
      <LoginGoogle />
    </div>
  </div>

  <div style="width: 50%;">
    <img src="/hero-image.png" alt="screenshot of actions.life" style="width: 100%; height: 100%; object-fit: cover;">
  </div>
</div>

<style lang="scss">
  .secondary-description {
    font-weight: 500;
    display: inline;
    color: rgb(100, 100, 100);
    font-size: 1.4vw;
    max-width: 800px;
    line-height: 1.3;
  }

  .hero-title {
    color: rgb(40, 40, 40);
    font-size: 2rem;
    font-weight: 600;
    max-width: 800px;
  }

  @media (min-width: 1280px) {
    .hero-title {
      margin-left: -6px;
      font-size: 3vw;
    }

    .action-buttons {
      width: 30vw;
    }
  }

  @media (max-width: 767.99px) {
    .secondary-description {
      font-size: 16px;
      margin-top: 8px;
    }

    .hero-title {
      margin-top: 8px;
      font-size: 3vw;
    }

    .action-buttons {
      margin-top: 16px;
    }
  }
</style> 