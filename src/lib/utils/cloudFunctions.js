import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions'
import { app } from '$lib/db/init.js'

const functions = getFunctions(app)
// connectFunctionsEmulator(functions, "127.0.0.1", 5001)

export function cloudFunction (fnName, params = {}) {
  const fn = httpsCallable(functions, fnName)
  return fn(params)
}