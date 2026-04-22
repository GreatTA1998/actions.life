<script>
  import MuxPlayer from './MuxPlayer.svelte'

  let {
    transcript = []
  } = $props()

  let player = $state(null)
  let showTranscript = $state(true)

  transcript = [
    { t: 0,    title: 'Quickstart', text: 'Click empty spaces to create a task. Indent your click to create sub-tasks.' }, // 'To create tasks, click on empty spaces, indentation matters'
    { t: 30,   title: 'Why?', text: 'To unify fragmented lists, reminders and calendars under one unified picture'},
    { t: 104,  title: 'Calendar as to-do list', text: '' },
    { t: 130,  title: 'Habits as icons', text: '' },
    { t: 190,  title: 'Integrated timeline', text: "What's important is rarely urgent. It helps to see long-term priorities often." },
    { t: 242,  title: 'Conclusion', text: "It's not designed to replace knowledge bases and pen and paper" }
  ]

  function seek (t, e) {
    e.stopPropagation()
    player.currentTime = t
    if (player.paused) player.play()
  }

  function timestamp (seconds) {
    const mm = Math.floor(seconds / 60);
    const ss = seconds % 60 
    return `${mm}:${ss.toString().padStart(2, '0')}`;
  }
</script>

<div class={['w-9/10 relative flex justify-center']}>
  <MuxPlayer bind:el={player}
    title="Tutorial"
    playbackID="8023clBAWKJVnN024ccjV2KZgOq1gVXotRnhzTBQOb2Rg"
    aspectRatio={15.25/9}
    onplay={() => showTranscript = false}
    onpause={() => showTranscript = true}
  />

  {#if transcript.length && showTranscript}
    <div
      class={[
        'max-h-8/10 w-[240px] rounded-xl overflow-y-auto hide-scrollbar',
        'absolute top-0 right-0 bg-black/60 backdrop-blur-sm pt-2 pb-2 px-2'
      ]}
    >
      <div bind:this={scrollEl} class="p-2 space-y-2">
        {#each transcript as cue, i (i)}
          <button onclick={e => seek(cue.t, e)}
            class={['text-white block text-left leading-relaxed']}
          >
            <div class="flex gap-x-2 text-xs">
              <span class="text-[hsl(210_100%_88%)]">
                {timestamp(cue.t)}
              </span>
              <span>
                {cue.title}
              </span>
            </div>

            <div class="text-xs">
              {cue.text} 
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>