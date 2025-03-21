import { db } from '../init.js'
import { collection, getDocs, query, where, deleteDoc } from 'firebase/firestore'


const deleteTasksByName = async (name, userID) => {
    const tasksQuery = await query(collection(db, `users/${userID}/tasks`), where('name', '==', name))
    const querySnapshot = await getDocs(tasksQuery);
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
}

// deleteTasksByName('no days', '6uIcMMsBEkQ85OINCDADtrygzZx1');