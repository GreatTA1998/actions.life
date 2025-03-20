import { db } from "../init.js";
import {
    writeBatch,
    doc,
    getDocs,
    collection,
    getFirestore,
} from "firebase/firestore";
import {
    getStorage,
    ref,
    getDownloadURL,
} from "firebase/storage";

migrateIGIcons();

async function migrateIGIcons() {
    try {
        const firestore = getFirestore();
        const doodleIcons = await getDocs(collection(firestore, "doodleIcons"));
        const iconArray = doodleIcons.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const batch = writeBatch(db);
        for (const icon of iconArray) {
            const storage = getStorage();
            const iconRef = ref(storage, `icons/${icon.id}.png`);
            const url = await getDownloadURL(iconRef);
            const newIcon = {
                name: "the originals",
                isShareable: true,
                createdBy: "The Master",
                tags: "OG",
                url,
            }
            const docRef = doc(db, "icons", icon.id);
            batch.set(docRef, newIcon);
        }
        return batch.commit();
    } catch (err) {
        console.error("error in migrateIGIcons", err);
    }
}