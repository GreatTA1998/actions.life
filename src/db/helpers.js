import {
  doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, getDocs, query, where
} from 'firebase/firestore'
import { db } from './init'
import { deleteObject, getStorage, ref } from 'firebase/storage'

// Helpers all have the `firestore` prefix
export function firestoreRef (path) {
  return doc(db, path)
}

export async function setFirestoreDoc (path, newObject) {
  try {
    const ref = firestoreRef(path)
    return await setDoc(ref, newObject)
  } catch (error) {
    console.error('error in setFirestoreDoc, CRUD', error)
    console.error('payload was =', newObject)
  }
}

export function getFirestoreDoc (path) {
  return new Promise(async (resolve, reject) => {
    const ref = firestoreRef(path)
    const snapshot = await getDoc(ref)
    if (snapshot.exists()) {
      resolve({ id: snapshot.id, path: snapshot.ref.path, ...snapshot.data() })
    } else {
      reject('Doc doesn not exist for path =', path)
    }
  })
}

export function getFirestoreCollection (path) {
  return new Promise(async (resolve) => {
    const ref = collection(db, path)
    const snapshot = await getDocs(ref)
    const data = []
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, path: doc.ref.path, ...doc.data() })
    })
    resolve(data)
  })
}

export function getFirestoreQuery (query) {
  return new Promise(async (resolve) => {
    const snapshot = await getDocs(query)
    const data = []
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, path: doc.ref.path, ...doc.data() })
    })
    resolve(data)
  })
}

export function updateFirestoreDoc (path, updateObject) {
  return new Promise(async (resolve) => {
    const ref = firestoreRef(path)
    await updateDoc(ref, updateObject)
    resolve()
  })
}

export function createFirestoreQuery ({ collectionPath, criteriaTerms }) {
  const ref = collection(db, collectionPath)
  const q = query(
    ref,
    where(criteriaTerms[0], criteriaTerms[1], criteriaTerms[2])
  )
  return q
}

export function deleteFirestoreDoc (path) {
  return new Promise(async (resolve) => {
    const ref = firestoreRef(path)
    await deleteDoc(ref)
    resolve()
  })
}

export async function deleteImage ({ imageFullPath }) {
  const storage = getStorage()
  await deleteObject(ref(storage, imageFullPath))
  console.log('successfully deleted')
} 