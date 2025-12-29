<script>
  import AppContext from './AppContext.svelte'
  import { user, authChecked, loggedIn, firebaseAuth } from '$lib/store'
  import posthog from 'posthog-js'
  import { page } from '$app/state'
  import { goto } from '$app/navigation'
  import { onAuthStateChanged } from 'firebase/auth'
  import { onMount } from 'svelte'
  import { isMobile } from '$lib/utils/core.js'
  import { translateJSConstantsToCSSVariables } from '$lib/utils/constants.js'
  import DragDropContext from '$lib/components/DragDropContext.svelte'
  import TheSnackbar from '/src/routes/[user]/components/TheSnackbar.svelte'
  import ThePopoverInput from '$lib/components/ThePopoverInput.svelte'
  import { treesByDate } from '/src/routes/[user]/components/Calendar/service.js'
  import '@fontsource-variable/inter'

  let { children } = $props()

  onMount(() => {
    translateJSConstantsToCSSVariables()

    onAuthStateChanged($firebaseAuth, async (resultUser) => {
      authChecked.set(true) // from cookie, takes around 300 - 500ms
      
      if (page.url.pathname.startsWith('/legal')) return

      else if (!resultUser) {
        goto('/')
        user.set({})

        posthog.init('phc_Cm2c1eB0MCZLTjJDYHklZ7GUp0Ar7p5bIpF5hkCJPdo', { // see how new visitors interacts with home page demos
          api_host: 'https://us.i.posthog.com'         
        })
      } 
      
      else {
        goto(`/${resultUser.uid}/${isMobile() ? 'mobile' : ''}`)
        loggedIn.set(true)
      }
    })
  })
</script>

<div>
  <div
    style="z-index: 99; background: var(--offwhite-bg); width: 100vw; height: 100vh"
    class="center"
    class:invisible={$authChecked && (!$loggedIn || $loggedIn && $user.uid && Object.keys($treesByDate).length > 0)}
  >
    <img
      src="/logo-no-bg.png"
      class="app-loading-logo elementToFadeInAndOut center"
      alt="logo"
      style="width: 48px; height: 48px;"
    />
  </div>

  <div>
    <AppContext>
      <DragDropContext>
        {@render children()}
        
        <ThePopoverInput />

        <TheSnackbar />
      </DragDropContext>
    </AppContext>
  </div>
</div>

<style>
  :global(:root) {
    --accent-color: rgb(92, 101, 22);
    --base-color: rgb(0, 89, 125);
    --sub-color: rgb(172, 160, 78);

    --logo-twig-color: #b34f1b;
    --location-indicator-color: var(--logo-twig-color);
    --grip-line-color: rgba(0,0,0,0.175); /* 0.15 too faint for mf, 0.2 too prominent for me */
    --task-action-subtle-color: rgb(0,0,0,0.2); /*rgb(120, 120, 120); */
    --fine-control-color: rgb(120, 120, 120);
    --scheduled-info-color: rgb(0, 0, 0);
    --task-name-color: rgb(0, 0, 0);
    --left-padding: 6px; /* only applies to TaskElement, PhotoTaskElement, IconTaskElement */ 
    --width-within-column: 94%;

    --calendar-section-left-spacing: 2vw;
    --experimental-black: hsla(0, 100%, 0%, 0.6);
    --offwhite-bg: rgb(250, 250, 250);
    --faint-color: lightgrey;
    --popup-control: 1.67rem;
  }

  :global(*) {
    box-sizing: border-box;
    font-family: 'Inter Variable', sans-serif;
  }

  /* prevent accidental going back page */
  /* https://stackoverflow.com/questions/30636930/disable-web-page-navigation-on-swipeback-and-forward?rq=1 */
  :global(html, body) {
    overscroll-behavior-x: none;
  }

  /* adding body { height: 100% } and remove html, body { overflow: hidden} at least allows you to scroll the page back up from the mystery white space, whereas
  before the problem would happen AND you cannot scroll back up*/
  :global(body) {
    margin: 0;
    height: 100%;
  }

  /* Reset button's default styling */
  :global(button) {
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
    cursor: pointer;
    outline: inherit;
    text-align: center;

    /* Fix for Safari/iOS */
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
  }

  /** used in both <DayColumn/> and <FlexibleDayTask/> */
  :global(.cal-task-name) {
    font-weight: 500;
    font-size: 0.8rem;
    cursor: pointer; 
  }

  :global(.simple-flex) {
    display: flex;
    align-items: center;
  }

  :global(.new-task-icon) {  
    font-weight: 100;
    color: var(--task-action-subtle-color);
    font-size: 30px; 
    line-height: 0.3;
    cursor: pointer;  
  }

  /* NOTE: must have a explicitly set width */
  :global(.truncate-to-one-line) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Reused between some components */
  :global(.reset-textarea) {
    border: none;
    overflow: auto;
    outline: none;

    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    box-shadow: none;

    resize: none; /*remove the resize handle on the bottom right*/
  }

  :global(.main-content) {
    padding: 1rem;
    overflow-y: auto;
    height: 100%;
  }

  :global(.unselectable) {
    -moz-user-select: -moz-none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    -o-user-select: none;
    user-select: none;
  }

  /* Notion scrollbar styles */
  :global(::-webkit-scrollbar) {
    width: 6px;
    height: 6px;
    background: transparent;
  }
  :global(::-webkit-scrollbar-thumb) {
    background: #D3D1CB;
  }
  :global(::-webkit-scrollbar-track) {
    background: #EDECE9;
  }

  /* https://uxmovement.substack.com/p/how-to-use-surface-elevation-to-elevate
    We base low, medium and high elevation on this essay.
  */
  :global(.core-shadow) {
    box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1)
  }

  :global(.cast-shadow) {
    box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.08);
  }

  :global(.cast-shadow-max) {
    box-shadow: 0px 18px 36px rgba(0, 0, 0, 0.08);
  }

  :global(.paper-shadow) {
    box-shadow: 1px 1px 1px 1px rgba(0, 0, 0, 0.2), 1px 1px 1px 1px rgba(0, 0, 0, 0.19);
  }

  /* navbar > task-popup > calendar > each list-{id} */
  :global(::view-transition-group(task-popup)) {
    z-index: 4;
  }

  :global(::view-transition-group(floating-navbar)) {
    z-index: 3;
  }

  :global(::view-transition-group(grip-handle)) {
    z-index: 2;
  }

  :global(::view-transition-group(calendar)) {
    z-index: 1;
  }

  /* Decided on easeInOutCirc
    @see https://emilkowal.ski/ui/7-practical-animation-tips
    @see https://easings.co/

    Movement: position (left, top), size (w, h), transforms
  */
  :global(::view-transition-group(.list-item)) {
    z-index: 0;
    animation-duration: 0.15s;
    animation-timing-function: cubic-bezier(0.79,0.14,0.15,0.86);
  }

  /* affects opacity */
  :global(::view-transition-old(.list-item)),
  :global(::view-transition-new(.list-item)) {
    animation-duration: 0.15s;
    animation-timing-function: cubic-bezier(0.79,0.14,0.15,0.86);
  }

  :global(::view-transition-old(.static-ui)) {
    opacity: 0;
    animation-duration: 0s;
    animation: none; /* New is visible by default when old is hidden */
  }

  :global(::view-transition-new(.static-ui)) {   
    animation-duration: 0s;
    animation: none;
  }

  /* shared by time pickers, duration pickers etc. overrides local colors (non-global classes takes precedence apparently no matter the ordering) */
  :global(.highlighted-option) {
    color: black !important;
    font-weight: 600 !important;
  }

  /* utility classes (inspired by Tailwind, but custom for my needs) */
  :global(.absolute) {
    position: absolute;
  }

  :global(.relative) {
    position: relative;
  }

  :global(.sticky) {
    position: sticky;
  }

  :global(.flexbox) {
    display: flex;
  }

  :global(.content-center) {
    align-items: center;
  }

  :global(.grid) {
    display: grid;
  }

  :global(.z-1) {
    z-index: 1;
  }

  :global(.z-0) {
    z-index: 0;
  }

  :global(.top-0) {
    top: 0;
  }

  :global(.left-0) {
    left: 0;
  }

  :global(.text-left) {
    text-align: left;
  }

  :global(.gap-0) {
    gap: 0;
  }

  :global(.gap-8) {
    gap: 8px;
  }

  :global(.h-full) {
    height: 100%;
  }

  :global(.w-full) {
    width: 100%;
  }

  :global(.overflow-hidden) {
    overflow: hidden;
  }

  :global(.overflow-auto) {
    overflow: auto;
  }

  :global(.min-w-0) {
    min-width: 0;
  }

  :global(.min-h-0) {
    min-height: 0;
  }

  :global(.mt-0) {
    margin-top: 0;
  }

  :global(.mt-4) {
    margin-top: 4px;
  }

  :global(.touch-none) {
    touch-action: none;
  }

  :global(.hide-scrollbar) {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  :global(.hide-scrollbar::-webkit-scrollbar) {
    display: none;
    width: 0px;
    height: 0px;
    background: transparent;
  }

  /* Original layout.svelte styles */
  .invisible {
    visibility: hidden;
  }
  /* From Prabhakar's centering solution that works for iOS unlike StackOverflow
  https://github.com/project-feynman/v3/blob/d864f54d9a69e6cdf0beb7818e8b07a85cebb7eb/src/components/SeeExplanation.vue */
  .center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .elementToFadeInAndOut {
    animation: fadeInOut 1.4s ease-out 99 forwards;
  }

  @keyframes fadeInOut {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  
  @media screen and (min-width: 320px) {
    .app-loading-logo {
      width: 110px;
      height: 110px;
      border-radius: 18px;
    }
  }
  @media screen and (min-width: 768px) {
    .app-loading-logo {
      width: 250px;
      height: 250px;
      border-radius: 40px;
    }
  }

  :global(.ghost-negative) {
    position: absolute;
    bottom: calc(-1 * var(--heights-sub-dropzone))
  }

  :global(.benefits-explanation) {
    max-width: 520px;
    margin: 0 auto;
    padding: 0 0 0 0;
  }

  :global(.benefits-explanation p) {
    margin: 0;
    font-size: 16px;
    line-height: 1.6;
    color: #374151;
  }
</style>
