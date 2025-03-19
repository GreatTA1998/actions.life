import { db } from "./firestoreConnection"
import { getDocs, collection, query, where, updateDoc, onSnapshot } from "firebase/firestore"

// still used for templates
const updateQuickTasks = async ({userID, templateID, updates}) => {
  const q = query(collection(db, "users", userID, "tasks"), where("templateID", "==", templateID))
  const snapshot = await getDocs(q)
  const updatePromises = snapshot.docs.map(doc => updateDoc(doc.ref, updates))
  return Promise.all(updatePromises)
}

// still used for legacy lists
const listenToUnscheduled = (userUID, callback) => {
  try {
    const q = query(
      collection(db, "users", userUID, "tasks"),
      where("startDateISO", "==", ""),
      where("isDone", "==", false)
    )
    
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
      callback(tasks)
    }, (error) => {
      console.error("Error in listenToUnscheduled", error)
      callback([])
    })
  } catch (err) {
    console.error("Error setting up listener in listenToUnscheduled", err)
    return () => {} // Return a no-op unsubscribe function
  }
}

// used by AI
const getTasksJSONByRange = async (uid, startDate, endDate) => {
  const neededProperties = [
    "duration",
    "isDone",
    "name",
    "notes",
    "startDateISO",
    "startTime",
  ]
  const q = query(
    collection(db, "users", uid, "tasks"),
    where("rootStartDateISO", "!=", ""),
    where("rootStartDateISO", ">=", startDate),
    where("rootStartDateISO", "<=", endDate)
  )
  const getDataArray = (snapshot) => snapshot.docs.map((doc) => doc.data())
  const taskArray = await getDocs(q).then(getDataArray).catch(console.error)

  const reducetoNeeded = (task) =>
    neededProperties.reduce(
      (acc, prop) => ({ [prop]: task[prop] || "", ...acc }),
      {}
    )
  return JSON.stringify(taskArray.map(reducetoNeeded))
}

export default {
  updateQuickTasks,
  listenToUnscheduled,
  getTasksJSONByRange
}
