// WARNING: must restart the server for ANY little change in this file, since HMR will re-run and persistentLocalCache()'s config output is non-identical
import { initializeApp } from 'firebase/app'
import { initializeFirestore } from 'firebase/firestore'
import { initializeAuth, browserLocalPersistence, indexedDBLocalPersistence } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCOVm0X6UUQQcftXf066z_0hFk497j4dNY',
  authDomain: 'project-y-2a061.firebaseapp.com',
  projectId: 'project-y-2a061',
  storageBucket: 'project-y-2a061.appspot.com',
  messagingSenderId: '132745397287',
  appId: '1:132745397287:web:b34052fb4683bc85e73a02',
  measurementId: 'G-EZSLE84PYQ',
}

const app = initializeApp(firebaseConfig)

const db = initializeFirestore(app, {}, 'schema-compliant')

const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence]
})

export { app, db, auth }