<script>
  import RoundButton from '$lib/Reusable/RoundButton.svelte'
  import { user } from '/src/store'
  import { onMount } from 'svelte'
  import User from '/src/db/User'
  import Icon from '/src/db/Icon'

  let doodleIcons = null

  onMount(async () => {
    doodleIcons = await Icon.getAvailable($user.uid)
  })

  function unlockFeature() {
    if (
      confirm(
        "Thanks for being one of the earliest users in the world - I'll make sure this is one of the best decisions you've made. (And whenever you're willing to share brutally honest feedback, tell me without overly-polite filters so I have the best chance to make things better for you - my contact info is on the top right of the calendar :^)"
      )
    ) {
      User.update($user.uid, { isSubscriber: true })
    }
  }
</script>

<div style="margin-top: 12px;"></div>

{#if doodleIcons}
  {#each doodleIcons as doodleIcon}
    <!-- svelte-ignore a11y-missing-attribute -->
    <img src={doodleIcon.url} style="width: 48px; height: 48px;" />
  {/each}
{/if}

<div style="margin-top: 12px; cursor: default; font-size: 16px;">
  As I put more and more tasks onto my calendar, it created too much text that's
  increasingly hard to read.
  <br /><br />
  Visual icons are promising, but the popular icon libraries are still very limited
  in expressiveness, and often just don't represent the tasks well enough.
  <br /><br />
  Solution? Draw icons yourself (or just use your friends' and community's icons)
  The app pools together these drawings, and displays them with an alternative UI
  4x more compact (using a double-click mechanism):
  <br /><br />

  <div
    style="display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 0px;"
  >
    <!-- svelte-ignore a11y-missing-attribute -->
    <img src="/text-tasks.png" style="width: 200px; height: 156px;" />
    <div style="">---></div>
    <!-- svelte-ignore a11y-missing-attribute -->
    <img src="/icon-tasks.png" style="width: 204px; height: 40px;" />
  </div>

  <div>
    <br />
    It's not cheap, <b>$10/month</b>. You probably don't need it if you're a
    light user. But if you're someone with lots of habits and periodic routines,
    you might really enjoy this vibrant and compact version.
  </div>

  <div style="display: flex; align-items: center; margin-top: 24px; ">
    <div
      style="height: 40px; border: 2px solid #9859B6; width: 160px; display: flex; align-items: center; border-radius: 24px; padding: 16px;"
    >
      <a
        target="_blank"
        href="https://buy.stripe.com/8wMg2L4md6Le0aAdQR"
        style="margin-left: 4px; text-decoration: none;"
      >
        Pay with Stripe
      </a>
    </div>

    <RoundButton on:click={unlockFeature}>Unlock</RoundButton>
  </div>
  <div
    style="font-size: 14px; margin-top: 16px; margin-left: 8px; rgb(80, 80, 80)"
  >
    After you pay with Stripe, just press "unlock" :^)
  </div>
</div>
