import { z } from 'zod'
import { deleteDoc, doc, setDoc } from 'firebase/firestore'
import { db } from '$lib/db/init.js'
import { getStorage, ref, getDownloadURL, uploadString } from 'firebase/storage'

const Icon = {
  schema: z.object({
    url: z.string(),
    name: z.string(),
    isShareable: z.boolean(),
    createdBy: z.string()
  }),

  async uploadDataURL ({ id, iconObject }) {
    const url = await Icon.storeIconToBucket(id, iconObject.dataURL)
    delete iconObject.dataURL
    const validatedIcon = Icon.schema.parse({...iconObject, url})
    await setDoc(doc(db, 'icons', id), validatedIcon)
    return { ...validatedIcon, id }
  },

  async delete ({ id }) {
    return deleteDoc(doc(db, 'icons', id))
  },

  async storeIconToBucket (id, icon) {
    const storage = getStorage()
    const iconRef = ref(storage, `icons/${id}.png`)
    const snapshot = await uploadString(iconRef, icon, 'data_url')
    return getDownloadURL(snapshot.ref)
  }
}

export default Icon