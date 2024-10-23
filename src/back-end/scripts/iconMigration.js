import { sourceDB, db } from "../firestoreConnection.js";
import {
    getDoc,
    doc,
    getDocs,
    collection,
    query,
    setDoc,
    where,
    writeBatch,
} from "firebase/firestore";
import {
    getStorage,
    ref,
    getDownloadURL,
} from "firebase/storage";


async function migrateIcons() {
    const sourceIconRef = collection(sourceDB, "icons");
    const destinationIconRef = collection(db, "icons");

    // Migrate main user document
    const sourceIconSnapshot = await getDocs(sourceIconRef);
    for (const docSnapshot of sourceIconSnapshot.docs) {
        await setDoc(doc(destinationIconRef, docSnapshot.id), docSnapshot.data());
    }
}


const examinePeriodicTasks = async () => {
    const periodicTasksRef = collection(db, 'users', "46OCRjQornhVCBmt0uz7ITASqOP2", "periodicTasks");
    const querySnapshot = await getDocs(periodicTasksRef);
    console.log(querySnapshot.docs.map(doc => doc.data()));
    return;
}

