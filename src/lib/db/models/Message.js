import { z } from 'zod'
import { addDoc, collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '$lib/db/init.js'

const Message = {
  schema: z.object({
    content: z.string().trim().min(1),
    parentID: z.string().default(''),
    uid: z.string().min(1),
    nickname: z.string().trim().min(1),
    serverTimestamp: z.number().int().positive()
  }),

  create: async ({ content, parentID = '', uid, nickname }) => {
    const payload = Message.schema.parse({
      content,
      parentID,
      uid,
      nickname,
      serverTimestamp: Date.now()
    })
    await addDoc(collection(db, 'messages'), payload)
    return payload
  },

  listenByParent: (parentID, callback) => {
    return onSnapshot(
      query(
        collection(db, 'messages'),
        where('parentID', '==', parentID),
        orderBy('serverTimestamp', 'asc')
      ),
      snapshot => callback(snapshot.docs.map(
        doc => ({ ...doc.data(), id: doc.id }))
      )
    )
  }
}

export default Message