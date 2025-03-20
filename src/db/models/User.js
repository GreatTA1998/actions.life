import { db } from "../init";
import {
  doc,
  updateDoc,
  arrayUnion,
  collection
} from "firebase/firestore";

const update = (userUID, keyValueChanges) => {
  return updateDoc(doc(db, "users", userUID), keyValueChanges).catch((err) =>
    console.error("error in User.update", err)
  );
};

const addIconURL = (userUID, name, url, hidden) => {
  return addDoc(collection(db, "users", userUID, "icons"), {
    url,
    name,
    hidden,
  }).then(() => url).catch((err) => console.error("error in User.addIcon", err));
};

const addFCMToken = (userUID, FCMToken) => {
  return updateDoc(doc(db, "users", userUID), {
    FCMTokens: arrayUnion(FCMToken),
  }).catch((err) => console.error("error in User.update", err));
};

export default {
  update,
  addFCMToken,
  addIconURL,
};
