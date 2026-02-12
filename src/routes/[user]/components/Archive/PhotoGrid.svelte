<script>
  import MultiPhotoUploader from '$lib/components/MultiPhotoUploader.svelte'
  import MonthYearMenus from '$lib/components/MonthYearMenus.svelte'
  import RandomButton from '$lib/components/RandomButton.svelte'
  import { user, updateCache, openTaskPopup } from '$lib/store/index.js'
  import { onMount, onDestroy} from 'svelte'
  import { DateTime } from 'luxon'
  import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore'
  import { db } from '$lib/db/init.js'
  import { lazyCallable } from '$lib/utils/svelteActions.js'

  let photos = $state(null)
  let unsub = () => {}
  let totalSize = 0
  const batchSize = 50 // small batch sizes, ironically, causes more wasteful re-renders as size increases
  let dt = $state(DateTime.now().endOf('month'))

  onMount(getBatch)

  $effect(() => {
    getBatch(dt)
  })

  onDestroy(unsub)

  async function getBatch () {
    unsub()
    totalSize += batchSize
    unsub = onSnapshot(pseudoPaginationQuery(totalSize), snapshot => {
      const resultDocs = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
      updateCache(resultDocs)
      photos = resultDocs
    })
  }

  function pseudoPaginationQuery (size) {
    return query(
      collection(db, `users/${$user.uid}/tasks`),
      where('imageDownloadURL', '!=', ''),
      where('startDateISO', '<=', dt.toFormat('yyyy-MM-dd')),
      orderBy('startDateISO', 'desc'),
      limit(size)
    )
  }
  
  function showRandomPhotos () {
    // TO BE RE-IMPLEMENTED
  }
</script>

<div class="h-full basis-full flex flex-col relative">
  <MultiPhotoUploader style="position: absolute; right: 1vw; top: 1vw;"/>

  <div class="shrink-0 flex items-center">
    <MonthYearMenus {dt} onChange={({ newVal }) => dt = newVal} />

    <RandomButton onclick={showRandomPhotos} />
  </div>
  
  <div class="flex-1 overflow-y-auto hide-scrollbar">
    <div class="grid gap-[2px]" 
      style:grid-template-columns="repeat(auto-fill, minmax(360px, 1fr))"
    >
      {#each photos as task (task.id)}
        <div onclick={() => openTaskPopup(task)} 
          class="relative min-w-[360px] aspect-square cursor-pointer"
        >
          <img src={task.imageDownloadURL} 
            class="object-cover w-full h-full"
            loading="lazy"
          />
          <div class="absolute inset-x-0 bottom-0 flex justify-between p-3 text-white"
            style:background="linear-gradient(transparent, rgba(0,0,0,0.7))"
          >
            <div class="truncate">
              {task.name}
            </div>

            <div style:white-space="nowrap">
              {DateTime.fromISO(task.startDateISO).toFormat('MMM d, yyyy')}
            </div>
          </div>
        </div>
      {/each}

      <div use:lazyCallable={getBatch} class="h-[480px]">

      </div>
    </div>
  </div>
</div>