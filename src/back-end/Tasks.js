import { db } from "./firestoreConnection";
import { getRandomID } from "../helpers/everythingElse.js";
import {
  doc,
  getDocs,
  getDoc,
  collection,
  query,
  where,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  onSnapshot
} from "firebase/firestore";

const updateQuickTasks = async ({userID, templateID, updates}) => {
  const q = query(collection(db, "users", userID, "tasks"), where("templateID", "==", templateID));
  const snapshot = await getDocs(q);
  const updatePromises = snapshot.docs.map(doc => updateDoc(doc.ref, updates));
  return Promise.all(updatePromises);
}

// One-time query for tasks in a date range
const getByDateRange = (userUID, startDate, endDate) => {
  try {
    const q = query(
      collection(db, "users", userUID, "tasks"),
      where("rootStartDateISO", ">=", startDate),
      where("rootStartDateISO", "<=", endDate)
    );
    return getDocs(q).then((snapshot) =>
      snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    );
  } catch (err) {
    console.error("Error in getByDateRange", err);
  }
};

// still used for legacy lists
// NOTE: probably un-used as this is NOT the criteria for the multi-list tasks
// Listen to unscheduled tasks
const listenToUnscheduled = (userUID, callback) => {
  try {
    const q = query(
      collection(db, "users", userUID, "tasks"),
      where("startDateISO", "==", ""),
      where("isDone", "==", false)
    );
    
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      callback(tasks);
    }, (error) => {
      console.error("Error in listenToUnscheduled", error);
      callback([]);
    });
  } catch (err) {
    console.error("Error setting up listener in listenToUnscheduled", err);
    return () => {}; // Return a no-op unsubscribe function
  }
};

// One-time query for unscheduled tasks
const getUnscheduled = (userUID) => {
  const q = query(
    collection(db, "users", userUID, "tasks"),
    where("startDateISO", "==", ""),
    where("isDone", "==", false)
  );

  return getDocs(q).then((snapshot) =>
    snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
  );
};

// Create a new task
const post = async ({ userUID, task, taskID }) => {
  // If task has startDateISO, ensure it has rootStartDateISO
  if (task.startDateISO && !task.rootStartDateISO) {
    // If it has a parent, we need to find the parent's rootStartDateISO
    if (task.parentID) {
      try {
        const parentDocRef = doc(db, "users", userUID, "tasks", task.parentID);
        const parentDocSnap = await getDoc(parentDocRef);
        if (parentDocSnap.exists() && parentDocSnap.data().rootStartDateISO) {
          task.rootStartDateISO = parentDocSnap.data().rootStartDateISO;
        } else {
          task.rootStartDateISO = task.startDateISO;
        }
      } catch (error) {
        console.error("Error getting parent task for rootStartDateISO", error);
        task.rootStartDateISO = task.startDateISO;
      }
    } else {
      // Root node gets its own startDateISO as rootStartDateISO
      task.rootStartDateISO = task.startDateISO;
    }
  }
  
  return setDoc(doc(db, "users", userUID, 'tasks', taskID), task);
};

// Simple function to update a task document without any side effects
const updateTaskDoc = ({ userUID, taskID, keyValueChanges }) => {
  return updateDoc(doc(db, "users", userUID, 'tasks', taskID), keyValueChanges);
};

// Delete a task and update its children
const remove = async ({ userUID, taskID }) => {
  const batch = writeBatch(db)

  const childrenSnapshot = await getDocs(
    query(collection(db, "users", userUID, "tasks"), where("parentID", "==", taskID))
  )
  batch.delete(doc(db, "users", userUID, 'tasks', taskID))
  
  if (!childrenSnapshot.empty) {
    childrenSnapshot.docs.forEach(childDoc => {
      batch.update(childDoc.ref, { parentID: "" })
    })
  }
  await batch.commit()
}

// Get tasks in JSON format for a date range
const getTasksJSONByRange = async (uid, startDate, endDate) => {
  const neededProperties = [
    "duration",
    "isDone",
    "name",
    "notes",
    "startDateISO",
    "startTime",
  ];
  const q = query(
    collection(db, "users", uid, "tasks"),
    where("rootStartDateISO", "!=", ""),
    where("rootStartDateISO", ">=", startDate),
    where("rootStartDateISO", "<=", endDate)
  );
  const getDataArray = (snapshot) => snapshot.docs.map((doc) => doc.data());
  const taskArray = await getDocs(q).then(getDataArray).catch(console.error);

  const reducetoNeeded = (task) =>
    neededProperties.reduce(
      (acc, prop) => ({ [prop]: task[prop] || "", ...acc }),
      {}
    );
  return JSON.stringify(taskArray.map(reducetoNeeded));
};

// Migration function (kept for reference but can be removed if no longer needed)
const migrateToRootStartDateISO = async (userUID) => {
  try {
    // First, get all tasks with startDateISO
    const q = query(
      collection(db, "users", userUID, "tasks"),
      where("startDateISO", "!=", "")
    );
    
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    
    // Build a map of tasks by ID for quick lookup
    const tasksById = {};
    tasks.forEach(task => {
      tasksById[task.id] = task;
    });
    
    // Function to find the root ancestor's startDateISO
    const findRootStartDateISO = (task) => {
      if (!task.parentID || task.parentID === "") {
        return task.startDateISO; // Parent not found, use own startDateISO
      }
      
      const parent = tasksById[task.parentID];
      if (!parent) {
        return task.startDateISO; // Parent not found, use own startDateISO
      }
      
      return findRootStartDateISO(parent);
    };
    
    // Update all tasks with rootStartDateISO
    const batch = writeBatch(db);
    const batchSize = 500; // Firestore batch limit is 500
    let batchCount = 0;
    let currentBatch = writeBatch(db);
    
    for (const task of tasks) {
      const rootStartDateISO = findRootStartDateISO(task);
      
      if (batchCount >= batchSize) {
        await currentBatch.commit();
        currentBatch = writeBatch(db);
        batchCount = 0;
      }
      
      currentBatch.update(doc(db, "users", userUID, "tasks", task.id), { rootStartDateISO });
      batchCount++;
    }
    
    if (batchCount > 0) {
      await currentBatch.commit();
    }
    
    return { success: true, message: `Updated ${tasks.length} tasks with rootStartDateISO` };
  } catch (err) {
    console.error("Error in migrateToRootStartDateISO", err);
    return { success: false, error: err.message };
  }
};

export default {
  updateQuickTasks,
  getByDateRange,
  getUnscheduled,
  listenToUnscheduled,
  post,
  updateTaskDoc,
  getTasksJSONByRange,
  remove,
  migrateToRootStartDateISO,
};
