import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyD_IywY_JIbF9AE0ox5Ll-DDZ_sm7vBzaE",
  authDomain: "plc-banking.firebaseapp.com",
  projectId: "plc-banking",
  storageBucket: "plc-banking.firebasestorage.app",
  messagingSenderId: "873314997522",
  appId: "1:873314997522:web:0cc1e2bc1348d83b1e0fcb"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

let firebaseReadyPromise = null;

export function ensureFirebaseReady() {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }

  if (!firebaseReadyPromise) {
    firebaseReadyPromise = signInAnonymously(auth);
  }

  return firebaseReadyPromise;
}