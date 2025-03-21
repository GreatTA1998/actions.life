import { sourceDB, db } from "../init.js";
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

