<script>
  let { children } = $props()

  let choice = $state(null) // null | 'simple' | 'structured'
</script>

{#if choice === null}
  <div class="min-h-screen flex flex-col items-stretch justify-center gap-12 px-6">
    <div class="flex justify-center items-center">
      <!-- <img src="/logo-no-bg.png" style="width: 48px; height: 48px;"> -->
      <!-- actions.life -->
    </div>

    <!-- <p class="text-4xl font-medium text-center">
      Which tools do you prefer?
    </p> -->
    <div class="flex flex-wrap gap-6 justify-center">
      <button onclick={() => choice = 'simple'}
        class="
          flex flex-col items-center gap-3 p-8 rounded-2xl
          bg-white/80 backdrop-blur-sm border
          border-neutral-400 shadow-lg
          min-w-[180px]
        "
      >
        <!-- <span class="text-left text-xl font-medium text-neutral-700">I keep it simple</span> -->

        <!-- Artistic hand-drawn pen and paper illustration -->
        <svg viewBox="0 0 120 120" class="w-32 h-32 drop-shadow-sm" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <defs>
            <filter id="roughness">
              <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" />
            </filter>
          </defs>
          
          <g filter="url(#roughness)" class="text-neutral-400">
            <!-- Notebook paper with organic, sketchy edges -->
            <path d="M35,30 C40,27 85,27 90,30 L93,95 C93,102 85,105 35,105 C28,105 25,102 25,95 L22,35 C22,30 28,27 35,30 Z" fill="white" />
            <path d="M35,30 C40,27 85,27 90,30 L93,95 C93,102 85,105 35,105 C28,105 25,102 25,95 L22,35 C22,30 28,27 35,30 Z" />
            
            <!-- Horizontal lines for paper -->
            <path d="M35,45 L85,45" opacity="0.3" stroke-width="0.8" />
            <path d="M35,58 L85,58" opacity="0.3" stroke-width="0.8" />
            <path d="M35,71 L85,71" opacity="0.3" stroke-width="0.8" />
            <path d="M35,84 L85,84" opacity="0.3" stroke-width="0.8" />
            
            <!-- Pen with a slight tilt -->
            <g transform="rotate(-12 100 85)" class="text-neutral-500">
              <path d="M95,35 L103,35 L103,90 L99,102 L95,90 Z" fill="white" />
              <path d="M95,35 L103,35 L103,90 L99,102 L95,90 Z" stroke-width="1.5" />
              <!-- Pen clip -->
              <path d="M103,45 L108,45 L108,65 L103,65" stroke-width="1" />
              <!-- Pen tip detail -->
              <path d="M96.5,92 L101.5,92" opacity="0.5" />
            </g>

            <!-- Charming little sparkles/stars -->
            <path d="M20,25 L22,23 M22,25 L20,23" stroke-width="0.8" class="text-amber-400" />
            <path d="M110,20 L113,17 M113,20 L110,17" stroke-width="0.8" class="text-amber-400" />
            <circle cx="15" cy="45" r="1" fill="currentColor" class="text-amber-300" />
            <circle cx="105" cy="110" r="1.5" fill="currentColor" class="text-amber-300" />
          </g>
        </svg>

        <!-- <span class="text-sm text-neutral-500 text-center">
          Use my head + pen and paper
        </span> -->

        <!-- <hr style="border: 1px solid grey; width: 100%;">

        <div class="flex items-center gap-3">
          <img src="/logo-no-bg.png" alt="actions.life" class="shrink-0 w-8 h-8 rounded object-contain" />
          <div class="min-w-0">
            <span class="text-left font-medium text-neutral-800 block">Organize Photos</span>
            <span class="text-sm text-neutral-500">Highlight photos by attaching them to calendar events</span>
          </div>
        </div> -->
      </button>

      <button onclick={() => choice = 'structured'}
        class="
          flex flex-col gap-4 p-8 rounded-2xl
          bg-white/80 backdrop-blur-sm border border-neutral-200 shadow-lg
          min-w-[280px] max-w-[600px]
        "
      >
        <!-- <span class="text-xl font-medium text-neutral-700 text-center">I already have a system</span> -->

        <div class="flex flex-col gap-4 text-left">
          <div class="flex items-center gap-3">
            <svg class="logo-notion-svg shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.88 128.1" width="32" height="32" aria-label="Notion"><path fill-rule="evenodd" d="M21.19,22.46c4,3.23,5.48,3,13,2.49l70.53-4.24c1.5,0,.25-1.49-.25-1.74L92.72,10.5a14.08,14.08,0,0,0-11-3.23l-68.29,5c-2.49.24-3,1.49-2,2.49l9.73,7.72ZM25.42,38.9v74.21c0,4,2,5.48,6.48,5.23l77.52-4.48c4.49-.25,5-3,5-6.23V33.91c0-3.23-1.25-5-4-4.73l-81,4.73c-3,.25-4,1.75-4,5Zm76.53,4c.49,2.24,0,4.48-2.25,4.73L96,48.36v54.79c-3.24,1.74-6.23,2.73-8.72,2.73-4,0-5-1.24-8-5L54.83,62.55V99.66l7.73,1.74s0,4.48-6.23,4.48l-17.2,1c-.5-1,0-3.48,1.75-4l4.48-1.25V52.59l-6.23-.5a4.66,4.66,0,0,1,4.24-5.73l18.44-1.24L87.24,84V49.6l-6.48-.74a4.21,4.21,0,0,1,4-5l17.21-1ZM7.72,5.52l71-5.23C87.49-.46,89.73.05,95.21,4L117.89,20c3.74,2.74,5,3.48,5,6.47v87.42c0,5.47-2,8.71-9,9.21l-82.5,5c-5.24.25-7.73-.5-10.47-4L4.24,102.4c-3-4-4.24-7-4.24-10.46V14.24C0,9.76,2,6,7.72,5.52Z"/></svg>
             
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

            <!-- Todoist logo -->
            <svg class="shrink-0" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" aria-label="Todoist"><path d="M68.5 6h375C477.875 6 506 34.125 506 68.5v375c0 34.374-28.125 62.5-62.5 62.5h-375C34.125 506 6 477.873 6 443.5v-83.97l.881.513c21.325 12.419 71.75 41.781 84.1 48.756 7.475 4.22 14.625 4.113 21.831-.037 4.313-2.488 51.594-29.7 99.375-57.194l.232-.131.95-.55c49.712-28.606 99.58-57.306 101.787-58.581 4.331-2.5 4.55-10.169-.3-12.938l-3.4-1.937-.025-.019c-4.944-2.813-11.337-6.45-14.062-8.05-3.488-2.031-9.763-3.163-15.588.187-2.412 1.394-164.081 94.35-169.481 97.425-6.469 3.675-14.475 3.725-20.919-.006-5.094-2.95-85.381-49.6-85.381-49.6v-42.087l.887.518c21.325 12.42 71.744 41.782 84.094 48.75 7.475 4.22 14.625 4.12 21.831-.037 4.32-2.488 51.663-29.731 99.475-57.25l.382-.219.293-.169.17-.1c49.787-28.65 99.812-57.443 102.024-58.712 4.331-2.5 4.55-10.175-.3-12.944l-3.4-1.937c-4.944-2.813-11.356-6.469-14.087-8.069-3.488-2.031-9.763-3.162-15.588.188-2.412 1.393-164.081 94.35-169.481 97.424-6.469 3.675-14.475 3.725-20.919-.006C86.287 279.774 6 233.118 6 233.118v-42.081l.875.513c21.319 12.412 71.756 41.78 84.106 48.756 7.475 4.219 14.625 4.119 21.831-.038l99.594-57.318.125-.07c49.988-28.768 100.406-57.787 102.625-59.062 4.331-2.506 4.55-10.175-.3-12.943l-3.4-1.938c-4.944-2.812-11.356-6.469-14.087-8.062-3.488-2.038-9.763-3.17-15.588.18-2.412 1.395-164.081 94.357-169.481 97.426-6.469 3.675-14.475 3.725-20.919-.006C86.287 195.53 6 148.875 6 148.875V68.5C6 34.125 34.125 6 68.5 6z" fill="#e44232"/><path d="M112.812 240.262c4.32-2.487 51.738-29.775 99.594-57.312l.125-.075c49.988-28.77 100.406-57.782 102.625-59.063 4.331-2.5 4.55-10.175-.3-12.937l-3.4-1.938c-4.944-2.819-11.356-6.469-14.087-8.069-3.488-2.037-9.763-3.168-15.582.188-2.418 1.394-164.087 94.35-169.487 97.419-6.469 3.68-14.475 3.725-20.919-.007C86.287 195.525 6 148.868 6 148.868v42.169l.875.506c21.319 12.413 71.756 41.788 84.106 48.757 7.475 4.225 14.625 4.118 21.831-.038z" fill="#fff" fill-rule="nonzero"/><path d="M112.812 324.512c4.32-2.488 51.663-29.738 99.475-57.25l.382-.219c49.943-28.743 100.268-57.706 102.487-58.987 4.331-2.5 4.55-10.169-.3-12.938l-3.4-1.937c-4.944-2.813-11.356-6.469-14.087-8.069-3.488-2.031-9.763-3.162-15.582.188-2.418 1.393-164.087 94.35-169.487 97.424-6.469 3.675-14.475 3.725-20.919-.006-5.094-2.95-85.381-49.6-85.381-49.6v42.163l.887.518c21.325 12.42 71.744 41.775 84.094 48.75 7.475 4.22 14.625 4.113 21.831-.037z" fill="#fff" fill-rule="nonzero"/><path d="M212.419 351.43a354703.563 354703.563 0 00-99.607 57.326c-7.206 4.15-14.356 4.256-21.83.037-12.35-6.975-62.776-36.337-84.1-48.756L6 359.524v-42.168s80.287 46.656 85.381 49.6c6.444 3.731 14.45 3.687 20.919.006 5.4-3.069 167.069-96.025 169.487-97.419 5.82-3.356 12.094-2.225 15.582-.187 2.73 1.6 9.143 5.25 14.087 8.068 1.256.713 2.419 1.375 3.4 1.938 4.85 2.762 4.631 10.437.3 12.937-2.219 1.282-52.712 30.338-102.737 59.132z" fill="#fff" fill-rule="nonzero"/></svg>
          
            <img src="/logo-no-bg.png" style="width: 48px; height: 48px;">
          </div>

          <!-- <div class="text-right text-gray-500 text-sm">and </div> -->
          <!-- habit tracker, to-do list -->
          
        <!-- <hr style="border: none; border-top: 1px solid rgba(128, 128, 128, 0.3); width: 100%;"> -->

          <!-- <div class="flex items-center gap-3">
            <img src="/logo-no-bg.png" alt="actions.life" class="shrink-0 w-8 h-8 rounded object-contain" />
            <div class="min-w-0">
              <span class="font-medium text-neutral-800 block">Execution System</span>
              <span class="text-sm text-neutral-500">actions.life is a list-calendar app for coordinating small habits, long-term milestones and day-to-day tasks</span>
            </div>
          </div> -->
        </div>
      </button>
    </div>
  </div>
{:else if true}
  {@render children()}
{/if}