<script>
  import { formatDate } from '/src/helpers/everythingElse.js'
  import { user } from '/src/store/userStore.js'
  import { onMount } from 'svelte'
  import { getFirestoreQuery } from '/src/helpers/firestoreHelpers.js'
  import { collection, query, where, orderBy, limit } from 'firebase/firestore'
  import { db } from "/src/back-end/firestoreConnection"

  export let photoTasks = null

  onMount(() => {
    fetchPhotoTasks()
  })

  async function fetchPhotoTasks () {
    const ref = collection(db, '/users/' + $user.uid + '/tasks')
    const q = query(ref, 
      where('imageDownloadURL', '!=', ''),
      orderBy('imageDownloadURL'),
      orderBy('startDateISO', 'desc'),
      limit(10)
    )
    const temp = await getFirestoreQuery(q)
    photoTasks = temp
  }
</script>


<h2>Photos</h2>

<div class="photo-grid">
  {#if photoTasks}
    {#each photoTasks as task (task.id)}
      <div class="photo-grid-item">
        <img 
          src={task.imageDownloadURL} 
          alt="Task" 
          loading="lazy"
        />
        <div class="photo-overlay">
          <div class="photo-date">
            {formatDate(task.startDateISO)}
          </div>
          {#if task.notes}
            <div class="photo-caption">
              {task.notes}
            </div>
          {/if}
        </div>
      </div>
    {/each}
  {/if}
</div>

<style>
  .photo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
    padding: 16px 0;
  }

  .photo-grid-item {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 8px;
    background: #f0f0f0;
  }

  .photo-grid-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .photo-grid-item:hover img {
    transform: scale(1.05);
  }

  .photo-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px;
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
    color: white;
    opacity: 1;
  }

  .photo-date {
    font-weight: 500;
    margin-bottom: 4px;
  }

  .photo-caption {
    font-size: 0.9em;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
</style>