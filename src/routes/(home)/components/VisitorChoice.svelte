<script>
  let { children } = $props()
  let choice = $state(null) // null | 'simple' | 'structured'
</script>

{#if choice === null}
  <div class="min-h-screen flex flex-col items-stretch justify-center gap-12 px-6">
    <p class="text-lg text-neutral-600 font-medium">
      How do you prioritize what you do in life?
    </p>

    <div class="flex flex-wrap gap-6 justify-center">
      <button
        type="button"
        onclick={() => choice = 'simple'}
        style:flex="1 0 0"
        class="
          flex flex-col items-center gap-3 p-8 rounded-2xl
          bg-white/80 backdrop-blur-sm border border-neutral-200
          hover:border-neutral-400 hover:shadow-lg
          transition-all duration-200 min-w-[180px]
        "
      >
        <span class="text-2xl font-semibold text-neutral-800">I keep it simple</span>
        <span class="text-sm text-neutral-500 text-center">
          Pen and paper, use my head
        </span>
      </button>

      <button
        type="button"
        onclick={() => choice = 'structured'}
        style:flex="1 0 0"
        class="
          flex flex-col items-stretch gap-4 p-8 rounded-2xl
          bg-white/80 backdrop-blur-sm border border-neutral-200
          hover:border-neutral-400 hover:shadow-lg
          transition-all duration-200 min-w-[280px]
        "
      >
        <span class="text-2xl font-semibold text-neutral-800 text-center">I have a system</span>
        <div>Example stack</div>
        <div class="flex flex-col gap-4 text-left">
          <div class="flex items-center gap-3">
            <svg class="logo-notion-svg shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 128.1" width="32" height="32" aria-label="Notion"><path fill-rule="evenodd" d="M21.19,22.46c4,3.23,5.48,3,13,2.49l70.53-4.24c1.5,0,.25-1.49-.25-1.74L92.72,10.5a14.08,14.08,0,0,0-11-3.23l-68.29,5c-2.49.24-3,1.49-2,2.49l9.73,7.72ZM25.42,38.9v74.21c0,4,2,5.48,6.48,5.23l77.52-4.48c4.49-.25,5-3,5-6.23V33.91c0-3.23-1.25-5-4-4.73l-81,4.73c-3,.25-4,1.75-4,5Zm76.53,4c.49,2.24,0,4.48-2.25,4.73L96,48.36v54.79c-3.24,1.74-6.23,2.73-8.72,2.73-4,0-5-1.24-8-5L54.83,62.55V99.66l7.73,1.74s0,4.48-6.23,4.48l-17.2,1c-.5-1,0-3.48,1.75-4l4.48-1.25V52.59l-6.23-.5a4.66,4.66,0,0,1,4.24-5.73l18.44-1.24L87.24,84V49.6l-6.48-.74a4.21,4.21,0,0,1,4-5l17.21-1ZM7.72,5.52l71-5.23C87.49-.46,89.73.05,95.21,4L117.89,20c3.74,2.74,5,3.48,5,6.47v87.42c0,5.47-2,8.71-9,9.21l-82.5,5c-5.24.25-7.73-.5-10.47-4L4.24,102.4c-3-4-4.24-7-4.24-10.46V14.24C0,9.76,2,6,7.72,5.52Z"/></svg>
            <div class="min-w-0">
              <span class="font-medium text-neutral-800 block">Knowledge Base</span>
              <span class="text-xs text-neutral-500">Notion Databases let you organize and search large quantities of docs</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <!-- Google Logo -->
            <svg class="logo-gcal-svg shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 122.88" width="32" height="32" aria-label="Google Calendar">
              <polygon fill="#FFFFFF" points="93.78,29.1 29.1,29.1 29.1,93.78 93.78,93.78 93.78,29.1"/>
              <polygon fill="#F72A25" points="93.78,122.88 122.88,93.78 93.78,93.78 93.78,122.88"/>
              <polygon fill="#FBBC04" points="122.88,29.1 93.78,29.1 93.78,93.78 122.88,93.78 122.88,29.1"/>
              <polygon fill="#34A853" points="93.78,93.78 29.1,93.78 29.1,122.88 93.78,122.88 93.78,93.78"/>
              <path fill="#188038" d="M0,93.78v19.4c0,5.36,4.34,9.7,9.7,9.7h19.4v-29.1H0L0,93.78z"/>
              <path fill="#1967D2" d="M122.88,29.1V9.7c0-5.36-4.34-9.7-9.7-9.7h-19.4v29.1H122.88L122.88,29.1z"/>
              <path fill="#4285F4" d="M93.78,0H9.7C4.34,0,0,4.34,0,9.7v84.08h29.1V29.1h64.67V0L93.78,0z"/>
              <path fill="#1A73E8" d="M42.37,79.27c-2.42-1.63-4.09-4.02-5-7.17l5.61-2.31c0.51,1.94,1.4,3.44,2.67,4.51 c1.26,1.07,2.8,1.59,4.59,1.59c1.84,0,3.41-0.56,4.73-1.67c1.32-1.12,1.98-2.54,1.98-4.26c0-1.76-0.7-3.2-2.09-4.32 c-1.39-1.12-3.14-1.67-5.22-1.67H46.4v-5.55h2.91c1.79,0,3.31-0.48,4.54-1.46c1.23-0.97,1.84-2.3,1.84-3.99 c0-1.5-0.55-2.7-1.65-3.6s-2.49-1.35-4.18-1.35c-1.65,0-2.96,0.44-3.93,1.32c-0.97,0.88-1.7,2-2.12,3.24l-5.55-2.31 c0.74-2.09,2.09-3.93,4.07-5.52c1.98-1.59,4.51-2.39,7.58-2.39c2.27,0,4.32,0.44,6.13,1.32c1.81,0.88,3.23,2.1,4.26,3.65 c1.03,1.56,1.54,3.31,1.54,5.25c0,1.98-0.48,3.65-1.43,5.03c-0.95,1.37-2.13,2.43-3.52,3.16v0.33c1.79,0.74,3.36,1.96,4.51,3.52 c1.17,1.58,1.76,3.46,1.76,5.66c0,2.2-0.56,4.16-1.67,5.88c-1.12,1.72-2.66,3.08-4.62,4.07c-1.96,0.99-4.17,1.49-6.62,1.49 C47.41,81.72,44.79,80.91,42.37,79.27L42.37,79.27L42.37,79.27z M76.83,51.43l-6.16,4.45l-3.08-4.67l11.05-7.97h4.24v37.6h-6.05 V51.43L76.83,51.43z"/>
            </svg>
            <div class="min-w-0">
              <span class="font-medium text-neutral-800 block">Shared Calendar</span>
              <span class="text-xs text-neutral-500">Google Calendar has ubiquitous integration, including with actions.life</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <img src="/logo-no-bg.png" alt="actions.life" class="shrink-0 w-8 h-8 rounded object-contain" />
            <div class="min-w-0">
              <span class="font-medium text-neutral-800 block">Execution System</span>
              <span class="text-xs text-neutral-500">actions.life is a list-calendar interface that lets you coordinate life priorities and act on them, from tiny habits to long-term dreams.</span>
            </div>
          </div>
        </div>
      </button>
    </div>
  </div>
{:else}
  {#if children}
    {@render children()}
  {:else}
    <div class="p-8 text-neutral-500">Home content goes here.</div>
  {/if}
{/if}