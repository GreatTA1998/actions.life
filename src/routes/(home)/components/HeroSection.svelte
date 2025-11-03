<div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 24px;">
  <div 
    class="hero-texts"
    style="display: flex; flex-direction: column; row-gap: 16px;"
  >
    <div class="hero-title">Designed for life, not meetings</div>

    <div style="display: flex; flex-wrap: wrap;">
      <div class="secondary-description">
        Put habits and to-do lists in the calendar
      </div>
    </div>
  </div>

  <div class="hero-screenshot">
    <img src="/white-home-screenshot.jpg" alt="screenshot of actions.life" style="width: 100%; height: 100%; object-fit: cover;">
  </div>
</div>

<style lang="scss">
  .hero-texts {
    flex-basis: 40%;
    flex-grow: 0;
    max-width: 66ch;
    text-wrap: pretty;
  }

  .hero-title {
    color: rgb(20, 20, 20);
    font-weight: 600;
    max-width: 720px;
    margin-left: -2px;
    font-size: 3.4vw;
  }

  .secondary-description {
    font-weight: 500;
    display: inline;
    color: rgb(0, 0, 0);
    font-size: 1.4vw;
    max-width: 800px;
    line-height: 1.3;
  }

  img {
    width: 100%;
    height: auto;
  }

  .hero-screenshot {
    flex-basis: 50%;
    flex-grow: 1;
  }


  @media (max-width: 767.99px) {
    .hero-texts {
      flex-basis: 100%;
    }

    .hero-screenshot {
      flex-basis: 100%;
    }

    .secondary-description {
      font-size: 4vw;
      margin-top: 8px;
    }

    .hero-title {
      margin-top: 8px;
      font-size: 10vw;
    }
  }
</style> 