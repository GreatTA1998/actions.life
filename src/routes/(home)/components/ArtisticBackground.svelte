<div class="artistic-background">
  <div class="sky-strokes">
    <div class="stroke-1"></div>
    <div class="stroke-2"></div>
    <div class="stroke-3"></div>
    <div class="stroke-4"></div>
    <div class="stroke-5"></div>
  </div>
  
  <div class="orange-strokes">
    <div class="orange-stroke-1"></div>
    <div class="orange-stroke-2"></div>
  </div>
</div>

<style lang="scss">
  .artistic-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 0;
  }

  /* Base background gradient with subtle overlays */
  .artistic-background::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(ellipse 1400px 900px at 60% 10%, rgba(230, 245, 255, 0.3) 0%, rgba(210, 235, 255, 0.25) 30%, rgba(190, 220, 255, 0.15) 60%, transparent 80%),
      radial-gradient(ellipse 1200px 800px at 80% 25%, rgba(200, 230, 255, 0.25) 0%, rgba(180, 210, 245, 0.18) 40%, transparent 70%),
      radial-gradient(ellipse 1000px 600px at 40% 15%, rgba(220, 240, 255, 0.2) 0%, rgba(200, 225, 250, 0.15) 50%, transparent 75%),
      radial-gradient(ellipse 600px 400px at 20% 80%, rgba(151, 175, 121, 0.08) 0%, transparent 50%);
    pointer-events: none;
    z-index: -1;
  }

  .sky-strokes {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }

  .sky-strokes .stroke-1 {
    position: absolute;
    top: 3%;
    right: 5%;
    width: 550px;
    height: 100px;
    background: linear-gradient(25deg, transparent 0%, rgba(180, 220, 255, 0.35) 15%, rgba(160, 200, 245, 0.3) 35%, rgba(140, 180, 235, 0.2) 60%, rgba(120, 160, 225, 0.12) 80%, transparent 95%);
    transform: rotate(-12deg) skew(4deg, -1.5deg);
    filter: blur(3.2px);
  }

  .sky-strokes .stroke-2 {
    position: absolute;
    top: 12%;
    right: 15%;
    width: 480px;
    height: 85px;
    background: linear-gradient(35deg, transparent 0%, rgba(200, 240, 255, 0.3) 20%, rgba(180, 220, 255, 0.28) 45%, rgba(160, 200, 235, 0.18) 70%, rgba(140, 180, 215, 0.1) 85%, transparent 100%);
    transform: rotate(-18deg) skew(3deg, -1deg);
    filter: blur(3.5px);
  }

  .sky-strokes .stroke-3 {
    position: absolute;
    top: 25%;
    right: 35%;
    width: 400px;
    height: 70px;
    background: linear-gradient(40deg, transparent 0%, rgba(190, 230, 255, 0.28) 25%, rgba(170, 210, 250, 0.22) 50%, rgba(150, 190, 240, 0.15) 75%, rgba(130, 170, 220, 0.08) 90%, transparent 100%);
    transform: rotate(-22deg) skew(2deg, -0.5deg);
    filter: blur(3.8px);
  }

  .sky-strokes .stroke-4 {
    position: absolute;
    bottom: 25%;
    right: 10%;
    width: 350px;
    height: 60px;
    background: linear-gradient(-30deg, transparent 0%, rgba(210, 245, 255, 0.25) 30%, rgba(185, 220, 250, 0.2) 55%, rgba(160, 195, 235, 0.12) 80%, transparent 100%);
    transform: rotate(15deg) skew(-1deg, 0.3deg);
    filter: blur(4px);
  }

  .sky-strokes .stroke-5 {
    position: absolute;
    bottom: 35%;
    right: 40%;
    width: 280px;
    height: 50px;
    background: linear-gradient(-35deg, transparent 0%, rgba(175, 215, 255, 0.22) 35%, rgba(155, 195, 245, 0.18) 65%, rgba(135, 175, 225, 0.1) 85%, transparent 100%);
    transform: rotate(20deg) skew(-0.5deg, 0.2deg);
    filter: blur(4.2px);
  }

  .orange-strokes {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }

  .orange-strokes .orange-stroke-1 {
    position: absolute;
    bottom: 20%;
    right: 8%;
    width: 320px;
    height: 55px;
    background: linear-gradient(55deg, transparent 0%, rgba(255, 200, 140, 0.32) 25%, rgba(245, 180, 120, 0.28) 50%, rgba(235, 160, 100, 0.18) 75%, rgba(225, 140, 80, 0.1) 90%, transparent 100%);
    transform: rotate(25deg) skew(-2deg, 1deg);
    filter: blur(3.5px);
  }

  .orange-strokes .orange-stroke-2 {
    position: absolute;
    bottom: 30%;
    right: 25%;
    width: 280px;
    height: 45px;
    background: linear-gradient(60deg, transparent 0%, rgba(255, 220, 160, 0.28) 30%, rgba(250, 200, 140, 0.25) 55%, rgba(240, 180, 120, 0.15) 80%, transparent 100%);
    transform: rotate(30deg) skew(-1.5deg, 0.8deg);
    filter: blur(3.8px);
  }
</style>