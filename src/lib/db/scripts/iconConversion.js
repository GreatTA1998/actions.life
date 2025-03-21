import { db } from "../init.js";
import {
  writeBatch,
  doc,
  getDocs,
  collection,
  query,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadString,
} from "firebase/storage";

uploadIconsToStorage();

async function uploadIconsToStorage() {
  const q = query(collection(db, "/doodleIcons"));
  const querySnapshot = await getDocs(q);
  const iconArray = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    dataURL: doc.data().dataURL,
  }));
  await Promise.all(
    iconArray.map((doc) => storeIconToBucket(doc.id, doc.dataURL))
  ).catch((err) => console.error("error in store In Bucket", err));
}

async function storeIconToBucket(name, icon) {
  try {
    const storage = getStorage();
    const iconRef = ref(storage, `icons/${name}.png`);
    return await uploadString(iconRef, icon, "data_url").then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadURL) => { });
    });
  } catch (err) {
    console.error("error in storeIconToBucket", err);
  }
}
// const getImage = async () => {
//   const storage = getStorage();
//   const url = await getDownloadURL(
//     ref(storage, "gs://project-y-2a061.appspot.com/icons/download.png")
//   );
//   console.log(url);
// };
// getImage();
