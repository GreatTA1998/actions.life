import { writable, get } from 'svelte/store'
import { onSnapshot, query, collection, where } from 'firebase/firestore'
import { buildForest, findSubtree } from '$lib/db/tree.ts'
import { db } from '$lib/db/init.js'
import { user } from '$lib/store'
import { getFirestoreDoc } from '$lib/db/helpers.js'

export const popup = writable(false)
export const template = writable(null)
export const templates = writable([])
export const editingTemplateId = writable('')
export const templateTree = writable([])

let unsub = () => {}

export function openTemplateEditor (template) {
  editingTemplateId.set(template.id)
  popup.set(true)
}

export function closeTemplateEditor() {
  popup.set(false)
}

editingTemplateId.subscribe(
  $editingTemplateId => listenToAncestralTree($editingTemplateId)
)

async function listenToAncestralTree (id) {
  unsub()
  if (!id) return
  // firebase secretly does caching, so performance doesn't suffer
  const found = await getFirestoreDoc(`users/${get(user).uid}/templates/${id}`)
  template.set(found)

  unsub = onSnapshot(
    query(
      collection(db, `users/${get(user).uid}/templates`),
      where('rootID', '==', found.rootID)
    ),
    snapshot => {
      const results = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }))
      const [ancestralTree] = buildForest(results)
      const family = findSubtree({ id, tree: ancestralTree })
      templateTree.set(family)
    }
  )
}