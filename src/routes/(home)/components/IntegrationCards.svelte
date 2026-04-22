<script>
  import ApplePhotosLogo from './ApplePhotosLogo.svelte'
  import GoogleCalendarLogo from './GoogleCalendarLogo.svelte'
  import DemoVideo from './DemoVideo.svelte'
  import PortraitVideo from './PortraitVideo.svelte'

  const OPTIONS = {
    APPLE_PHOTOS: 'photo-user',
    GOOGLE_CALENDAR: 'google-calendar-user'
  }

  let audience = $state(OPTIONS.GOOGLE_CALENDAR)
</script>

<div class="flex flex-col items-center gap-12 w-full">
  <div class="flex flex-wrap justify-center gap-6 w-full max-w-[900px] px-6">
    <div onclick={() => audience = OPTIONS.APPLE_PHOTOS}
      class={[
        'flex items-center justify-center gap-6 p-8 min-w-[240px] flex-1 rounded-[20px] border border-[#e5e5e5]',
        'shadow-[0_4px_24px_rgba(0,0,0,0.06)]', 
        audience === OPTIONS.APPLE_PHOTOS && 'shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
      ]}
    >
      <div class="relative flex items-center justify-center">
        <ApplePhotosLogo/>
      </div>

      <div class="text-2xl font-semibold text-[#111]">+</div>

      <img src="/logo-no-bg.png" class="w-10 h-10 object-contain" alt="actions.life" />
    </div>

    <div onclick={() => audience = OPTIONS.GOOGLE_CALENDAR}
      class={[
        'flex items-center justify-center gap-6 p-8 min-w-[240px] flex-1 rounded-[20px] border border-[#e5e5e5]',
        'shadow-[0_4px_24px_rgba(0,0,0,0.06)]', 
        audience === OPTIONS.GOOGLE_CALENDAR && 'shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
      ]}
    >
      <GoogleCalendarLogo/>

      <div class="text-2xl font-semibold text-[#111]">+</div>

      <!-- Notion Logo SVG -->
      <!-- 
        <svg class="w-10 h-10" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 128.1"><path fill-rule="evenodd" d="M21.19,22.46c4,3.23,5.48,3,13,2.49l70.53-4.24c1.5,0,.25-1.49-.25-1.74L92.72,10.5a14.08,14.08,0,0,0-11-3.23l-68.29,5c-2.49.24-3,1.49-2,2.49l9.73,7.72ZM25.42,38.9v74.21c0,4,2,5.48,6.48,5.23l77.52-4.48c4.49-.25,5-3,5-6.23V33.91c0-3.23-1.25-5-4-4.73l-81,4.73c-3,.25-4,1.75-4,5Zm76.53,4c.49,2.24,0,4.48-2.25,4.73L96,48.36v54.79c-3.24,1.74-6.23,2.73-8.72,2.73-4,0-5-1.24-8-5L54.83,62.55V99.66l7.73,1.74s0,4.48-6.23,4.48l-17.2,1c-.5-1,0-3.48,1.75-4l4.48-1.25V52.59l-6.23-.5a4.66,4.66,0,0,1,4.24-5.73l18.44-1.24L87.24,84V49.6l-6.48-.74a4.21,4.21,0,0,1,4-5l17.21-1ZM7.72,5.52l71-5.23C87.49-.46,89.73.05,95.21,4L117.89,20c3.74,2.74,5,3.48,5,6.47v87.42c0,5.47-2,8.71-9,9.21l-82.5,5c-5.24.25-7.73-.5-10.47-4L4.24,102.4c-3-4-4.24-7-4.24-10.46V14.24C0,9.76,2,6,7.72,5.52Z"/></svg>
        <div class="text-2xl font-semibold text-[#111]">+</div> 
      -->

      <img src="/logo-no-bg.png" class="w-10 h-10 object-contain" alt="actions.life" />
    </div>
  </div>
</div>

{#if audience === OPTIONS.APPLE_PHOTOS}
  <PortraitVideo />
{:else if audience === OPTIONS.GOOGLE_CALENDAR}
  <DemoVideo />
{/if}